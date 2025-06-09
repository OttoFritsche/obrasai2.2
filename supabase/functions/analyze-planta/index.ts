import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlantaAnalysis {
  area_total: number
  comodos: Array<{
    nome: string
    area: number
    dimensoes: string
    tipo: string
  }>
  materiais_estimados: {
    ceramica: number
    tinta: number
    eletrica: number
    hidraulica: number
    alvenaria: number
  }
  orcamento_estimado: number
  insights_ia: string[]
  detalhes_tecnicos: {
    paredes_lineares: number
    portas_quantidade: number
    janelas_quantidade: number
    area_coberta: number
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let user: User | null = null
  let supabaseClient: SupabaseClient | null = null

  try {
    console.log('🚀 Iniciando análise de planta baixa...')

    // Verificar se é POST
    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method)
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Inicializar Supabase client
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verificar autenticação
    console.log('🔐 Verificando autenticação...')
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ Header de autorização não encontrado')
      return new Response(
        JSON.stringify({ error: 'Token de autorização obrigatório' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !authUser) {
      console.log('❌ Erro de autenticação:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    user = authUser
    console.log('✅ Usuário autenticado:', user.id)

    // Verificar rate limiting
    console.log('⏱️ Verificando rate limiting...')
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)

    const { data: rateLimitData, error: rateLimitError } = await supabaseClient
      .from('user_rate_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('action', 'analyze_planta')
      .maybeSingle()

    if (rateLimitError) {
      console.error('Erro ao verificar rate limit:', rateLimitError)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor', details: 'Rate limit check failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📊 Rate limit data:', rateLimitData)

    if (rateLimitData) {
      const lastRequest = new Date(rateLimitData.last_request_at)
      const timeDiff = now.getTime() - lastRequest.getTime()
      
      console.log('⏰ Time diff:', timeDiff, 'ms, Request count:', rateLimitData.request_count)
      
      if (timeDiff < 60000 && rateLimitData.request_count >= 3) {
        console.log('❌ Rate limit excedido')
        return new Response(
          JSON.stringify({ 
            error: 'Limite de análises excedido. Aguarde 1 minuto entre as análises (máximo 3 por minuto).' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Processar dados do corpo da requisição (JSON ao invés de FormData)
    console.log('📋 Processando dados do corpo da requisição...')
    const contentType = req.headers.get('content-type') || ''
    
    let fileBase64: string
    let fileName: string
    let fileType: string
    let obraId: string | null = null

    if (contentType.includes('application/json')) {
      // Dados enviados como JSON (padrão do supabase.functions.invoke)
      const body = await req.json()
      console.log('📄 Dados recebidos via JSON:', {
        hasFile: !!body.file,
        filename: body.filename,
        fileType: body.fileType,
        obra_id: body.obra_id
      })

      fileBase64 = body.file
      fileName = body.filename || 'planta.pdf'
      fileType = body.fileType || 'application/pdf'
      obraId = body.obra_id

      if (!fileBase64) {
        console.log('❌ Arquivo base64 não encontrado no JSON')
        return new Response(
          JSON.stringify({ error: 'Arquivo é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Dados enviados como FormData (fallback)
      const formData = await req.formData()
      const file = formData.get('file') as File
      obraId = formData.get('obra_id') as string

      if (!file) {
        console.log('❌ Arquivo não encontrado no FormData')
        return new Response(
          JSON.stringify({ error: 'Arquivo PDF é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      fileName = file.name
      fileType = file.type

      // Converter para base64
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      let binaryString = ''
      const chunkSize = 8192
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize)
        binaryString += String.fromCharCode.apply(null, chunk)
      }
      
      fileBase64 = btoa(binaryString)
    } else {
      console.log('❌ Content-Type não suportado:', contentType)
      return new Response(
        JSON.stringify({ error: 'Content-Type não suportado. Use application/json ou multipart/form-data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar arquivo
    console.log('📄 Validando arquivo:', fileName, fileType, 'Base64 length:', fileBase64?.length)
    
    if (!fileType.includes('pdf') && !fileType.includes('image')) {
      console.log('❌ Tipo de arquivo inválido:', fileType)
      return new Response(
        JSON.stringify({ error: 'Apenas arquivos PDF e imagens são aceitos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Estimar tamanho do arquivo (base64 é ~33% maior que o arquivo original)
    const estimatedSize = (fileBase64.length * 3) / 4
    if (estimatedSize > 10 * 1024 * 1024) { // 10MB
      console.log('❌ Arquivo muito grande:', estimatedSize)
      return new Response(
        JSON.stringify({ error: 'Arquivo deve ter no máximo 10MB' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔄 Arquivo validado, iniciando processamento...')

    // Atualizar rate limit
    console.log('📊 Atualizando rate limit...')
    try {
      const { error: upsertError } = await supabaseClient
        .from('user_rate_limits')
        .upsert({
          user_id: user.id,
          action: 'analyze_planta',
          last_request_at: new Date().toISOString(),
          request_count: (rateLimitData?.request_count || 0) + 1
        })

      if (upsertError) {
        console.error('Erro ao atualizar rate limit:', upsertError)
      }
    } catch (rateLimitUpdateError) {
      console.error('Erro no rate limit update:', rateLimitUpdateError)
    }

    console.log('🤖 Iniciando análise com GPT-4o...')
    
    // Analisar com GPT-4o
    const analysis = await analyzeFloorPlanWithGPT4o(fileBase64)

    console.log('✅ Análise concluída')

    // Salvar análise no banco se obra_id foi fornecido
    if (obraId) {
      console.log('💾 Salvando análise no banco...')
      try {
        const { error: insertError } = await supabaseClient
          .from('planta_analyses')
          .insert({
            user_id: user.id,
            obra_id: obraId,
            filename: fileName,
            analysis_data: analysis,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Erro ao salvar análise:', insertError)
        } else {
          console.log('✅ Análise salva no banco')
        }
      } catch (saveError) {
        console.error('Erro ao salvar:', saveError)
      }
    }

    console.log('🎉 Análise completada com sucesso!')

    // Adaptar para o formato esperado pelo frontend
    const responseData = {
      id: `analysis_${Date.now()}`,
      filename: fileName,
      analysis_data: {
        summary: `Análise de planta baixa com área total de ${analysis.area_total}m²`,
        areas: analysis.comodos.map(comodo => ({
          nome: comodo.nome,
          area: comodo.area,
          uso: comodo.tipo
        })),
        issues: [],
        recommendations: analysis.insights_ia,
        total_area: analysis.area_total,
        api_used: 'openai'
      },
      created_at: new Date().toISOString(),
      obra_id: obraId
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na análise da planta:', error)
    console.error('Stack trace:', error.stack)
    console.error('Error type:', typeof error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    
    // Registrar métricas de erro para análise
    if (user && supabaseClient) {
      try {
        const { error: metricsError } = await supabaseClient
          .from('metricas_ia')
          .insert({
            usuario_id: user.id,
            funcao_ia: 'analyze_planta',
            sucesso: false,
            erro_detalhes: `${error.name}: ${error.message}`,
            metadata: {
              user_agent: req.headers.get('user-agent'),
              error_stack: error.stack,
              timestamp: new Date().toISOString()
            }
          })
        
        if (metricsError) {
          console.error('Erro ao registrar métricas:', metricsError)
        }
      } catch (metricsInsertError) {
        console.error('Erro ao inserir métricas:', metricsInsertError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message,
        errorType: error.name || 'UnknownError',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function convertPDFToImage(base64PDF: string): Promise<string> {
  try {
    console.log('🔄 Tentando conversão PDF para imagem...')
    
    // Por enquanto, implementação simplificada
    // Em um ambiente real, usar pdf2pic ou similar
    
    // Para PDFs que são essencialmente imagens escaneadas,
    // vamos tentar extrair a primeira página como imagem
    
    console.log('⚠️ Conversão PDF avançada indisponível, usando fallback')
    throw new Error('Fallback para análise direta')
    
  } catch (error) {
    console.error('Erro na conversão PDF->Imagem:', error)
    
    // Fallback: tentar usar o PDF diretamente como base64
    // (funciona para PDFs simples/escaneados)
    console.log('🔄 Tentando análise direta do PDF...')
    throw error
  }
}

async function analyzeFloorPlanWithGPT4o(base64PDF: string): Promise<PlantaAnalysis> {
  try {
    console.log('🤖 Iniciando análise com GPT-4o...')
    
    // Verificar se temos a chave da OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('🔑 OpenAI Key status:', openaiKey ? `Encontrada (${openaiKey.substring(0, 8)}...)` : 'NÃO ENCONTRADA')
    
    if (!openaiKey) {
      console.error('⚠️ OPENAI_API_KEY não configurada')
      throw new Error('Serviço de análise de plantas temporariamente indisponível. Configuração da API necessária.')
    }
    
    let imageBase64 = base64PDF
    let actualFileType = fileType
    
    // Se for PDF, precisamos avisar que pode não funcionar bem
    if (fileType.includes('pdf')) {
      console.log('⚠️ Arquivo PDF detectado. GPT-4o Vision funciona melhor com imagens.')
      console.log('💡 Para melhores resultados, use uma imagem (JPG/PNG) da planta.')
      
      // Primeiro, tentar converter PDF para imagem
      try {
        imageBase64 = await convertPDFToImage(base64PDF)
        actualFileType = 'image/png'
        console.log('✅ PDF convertido para imagem')
      } catch (conversionError) {
        console.log('⚠️ Conversão PDF falhou, tentando análise direta')
        console.log('🔧 Motivo:', conversionError.message)
        // Usar o arquivo original 
        imageBase64 = base64PDF
      }
    }
    
    console.log('🔍 Enviando para análise GPT-4o...')
    
    // Fazer análise real com GPT-4o
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta planta baixa arquitetônica e extraia as informações solicitadas em formato JSON.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional antes ou depois.

Estrutura esperada:
{
  "area_total": number,
  "comodos": [
    {
      "nome": "string",
      "area": number,
      "dimensoes": "string", 
      "tipo": "social|intimo|servico|area_molhada|circulacao"
    }
  ],
  "materiais_estimados": {
    "ceramica": number,
    "tinta": number,
    "eletrica": number,
    "hidraulica": number,
    "alvenaria": number
  },
  "orcamento_estimado": number,
  "insights_ia": ["string"],
  "detalhes_tecnicos": {
    "paredes_lineares": number,
    "portas_quantidade": number,
    "janelas_quantidade": number,
    "area_coberta": number
  }
}

Instruções específicas:
- Analise cuidadosamente as medidas e escalas na planta
- Calcule áreas dos cômodos em m²
- Estime materiais: cerâmica/piso (m²), tinta (litros), pontos elétricos, pontos hidráulicos, alvenaria (m²)
- Orçamento baseado em R$ 1.200-1.800/m² (padrão médio brasileiro)
- Máximo 5 insights práticos sobre construção
- Conte elementos: portas, janelas, metragem linear de paredes

Se não conseguir ler a planta claramente, estime valores razoáveis para uma residência típica.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: actualFileType.includes('pdf') 
                    ? `data:application/pdf;base64,${imageBase64}`
                    : `data:${actualFileType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na API OpenAI:', response.status, response.statusText, errorText)
      
      if (response.status === 400) {
        throw new Error('Arquivo não suportado pela IA. Tente converter o PDF para imagem JPG/PNG.')
      } else if (response.status === 401) {
        throw new Error('Chave da API OpenAI inválida. Serviço temporariamente indisponível.')
      } else if (response.status === 429) {
        throw new Error('Limite de uso da IA excedido. Tente novamente em alguns minutos.')
      } else {
        throw new Error(`Erro no serviço de análise: ${response.status} - ${errorText}`)
      }
    }

    const result = await response.json()
    
    if (!result.choices || !result.choices[0]) {
      console.error('Resposta inválida da OpenAI:', result)
      throw new Error('Resposta inválida da IA')
    }

    const content = result.choices[0].message.content
    console.log('📝 Resposta bruta da IA:', content)

    // Tentar extrair JSON da resposta
    let jsonContent = content.trim()
    
    // Remover possíveis marcadores de código
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Parse do JSON retornado pela IA
    try {
      const analysis = JSON.parse(jsonContent)
      console.log('✅ Análise parseada com sucesso')
      
      // Validar estrutura básica
      if (!analysis.area_total || !analysis.comodos || !Array.isArray(analysis.comodos)) {
        throw new Error('Estrutura de resposta inválida')
      }
      
      return analysis as PlantaAnalysis
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError)
      console.error('Conteúdo recebido:', jsonContent)
      throw new Error('Falha ao processar resposta da IA - JSON inválido')
    }

  } catch (error) {
    console.error('❌ ERRO DETALHADO na análise com GPT-4o:')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error type:', typeof error)
    console.error('Error name:', error.name)
    
    // Retornar erro específico ao invés de dados mockados
    throw new Error(`Falha na análise da planta: ${error.message}. Verifique se o arquivo está legível ou tente uma imagem JPG/PNG.`)
  }
}

// Função de dados mockados REMOVIDA - nunca mais mentir para o cliente!