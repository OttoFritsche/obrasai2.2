import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuração da IA
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API')!
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

// Tipos
interface ContratoAIRequest {
  pergunta_usuario: string
  contexto_contrato: {
    tipo_servico?: string
    valor_total?: number
    prazo_execucao?: number
    titulo?: string
    descricao_servicos?: string
    clausulas_especiais?: string
    observacoes?: string
    template_id?: string
  }
  historico_conversa: ChatMessage[]
  contrato_id?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  suggestions?: AISuggestion[]
}

interface AISuggestion {
  tipo: "descricao" | "clausula" | "observacao"
  conteudo: string
  justificativa: string
  aplicado: boolean
}

interface ContratoAIResponse {
  resposta: string
  sugestoes: AISuggestion[]
  confianca: number
  fontes_referencia: string[]
  tempo_resposta_ms: number
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

try {
  serve(async (req: Request) => {
    // Tratar pré-flight CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders })
    }
    const startTime = Date.now()

    // DEBUG: Logar início da função
    console.log('🟢 Início da função contrato-ai-assistant')
    // DEBUG: Logar variáveis de ambiente essenciais
    console.log('🔑 SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
    console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    console.log('🔑 DEEPSEEK_API:', Deno.env.get('DEEPSEEK_API') ? 'OK' : 'NÃO DEFINIDA')
    // DEBUG: Logar headers recebidos
    console.log('📦 Headers recebidos:', JSON.stringify([...req.headers]))

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização necessário')
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar usuário
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    // Parse do request
    const { 
      pergunta_usuario, 
      contexto_contrato, 
      historico_conversa,
      contrato_id 
    }: ContratoAIRequest = await req.json()

    console.log('🤖 Pergunta recebida:', pergunta_usuario)
    console.log('📋 Contexto do contrato:', contexto_contrato)

    // Buscar template específico se disponível
    let templateInfo = null
    if (contexto_contrato.template_id) {
      const { data: template } = await supabase
        .from('templates_contratos')
        .select('nome, tipo_servico, ia_prompts, ia_sugestoes_padrao')
        .eq('id', contexto_contrato.template_id)
        .single()
      
      templateInfo = template
    }

    // Construir prompt especializado
    const systemPrompt = `Você é um especialista em contratos de construção civil brasileira com conhecimento profundo em:

🏗️ ESPECIALIDADES:
- Normas técnicas ABNT (NBR 15575, NBR 12721, NBR 8036, etc.)
- Legislação brasileira (Código Civil, CLT, CDC, Lei 8.666)
- Tipos de contrato: Empreitada, Fornecimento, Mão de obra, Mistos
- Práticas do mercado de construção civil
- Gestão de obras e responsabilidades técnicas

📋 CONTEXTO ATUAL:
${templateInfo ? `Template: ${templateInfo.nome} (${templateInfo.tipo_servico})` : 'Template genérico'}
Título: ${contexto_contrato.titulo || 'Não informado'}
Valor: ${contexto_contrato.valor_total ? `R$ ${contexto_contrato.valor_total.toLocaleString('pt-BR')}` : 'Não informado'}
Prazo: ${contexto_contrato.prazo_execucao || 'Não informado'} dias

🎯 DIRETRIZES OBRIGATÓRIAS:
1. Sempre incluir referências a normas técnicas aplicáveis
2. Considerar aspectos de segurança do trabalho (NRs)
3. Mencionar responsabilidades sobre materiais quando relevante
4. Sugerir cláusulas de proteção mútua
5. Adaptar linguagem técnica ao contexto brasileiro
6. Incluir aspectos de garantia e assistência técnica
7. Considerar questões climáticas e sazonais brasileiras

🔧 FORMATO DE RESPOSTA:
- Resposta clara e objetiva à pergunta
- Sugestões práticas e aplicáveis
- Justificativas técnicas ou legais
- Referências normativas quando aplicável

Responda de forma profissional, prática e adequada à construção civil brasileira.`

    // Construir mensagens da conversa
    const messages = [
      { role: "system", content: systemPrompt },
      ...historico_conversa.slice(-10).map(msg => ({ // Últimas 10 mensagens
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user", 
        content: `Contexto técnico: ${JSON.stringify(contexto_contrato, null, 2)}\n\nPergunta: ${pergunta_usuario}`
      }
    ]

    // Chamar API da DeepSeek
    console.log('🔄 Enviando para DeepSeek...')
    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    })

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text()
      console.error('❌ Erro DeepSeek:', errorText)
      throw new Error(`Erro na API DeepSeek: ${deepseekResponse.status}`)
    }

    const deepseekData = await deepseekResponse.json()
    const aiResponse = deepseekData.choices[0].message.content
    const tempoResposta = Date.now() - startTime

    console.log('✅ Resposta da IA recebida:', aiResponse.substring(0, 100) + '...')

    // Gerar sugestões baseadas no contexto
    const sugestoes: AISuggestion[] = []

    // Sugestões inteligentes baseadas na pergunta
    if (pergunta_usuario.toLowerCase().includes('descriç')) {
      sugestoes.push({
        tipo: "descricao",
        conteudo: "Execução de serviços de acordo com as normas técnicas ABNT, incluindo fornecimento de materiais de primeira qualidade e mão de obra especializada, com supervisão técnica permanente.",
        justificativa: "Descrição padronizada que atende requisitos técnicos e legais",
        aplicado: false
      })
    }

    if (pergunta_usuario.toLowerCase().includes('cláusula') || pergunta_usuario.toLowerCase().includes('clausula')) {
      sugestoes.push({
        tipo: "clausula",
        conteudo: "O CONTRATADO declara conhecer e se compromete a cumprir todas as normas de segurança do trabalho (NRs), respondendo civil e criminalmente por acidentes decorrentes de negligência ou imperícia.",
        justificativa: "Cláusula essencial para responsabilização sobre segurança do trabalho",
        aplicado: false
      })
    }

    if (pergunta_usuario.toLowerCase().includes('observ') || pergunta_usuario.toLowerCase().includes('material')) {
      sugestoes.push({
        tipo: "observacao",
        conteudo: "Todos os materiais utilizados devem possuir certificação do INMETRO quando aplicável, sendo apresentadas as notas fiscais e certificados de qualidade antes da aplicação.",
        justificativa: "Garantia de qualidade e rastreabilidade dos materiais",
        aplicado: false
      })
    }

    // Calcular confiança baseada em fatores
    let confianca = 0.8 // Base alta por ser especializado
    if (contexto_contrato.titulo) confianca += 0.05
    if (contexto_contrato.valor_total) confianca += 0.05
    if (contexto_contrato.template_id) confianca += 0.1
    confianca = Math.min(confianca, 1.0)

    // Fontes de referência
    const fontesReferencia = [
      "ABNT NBR 15575 - Edificações habitacionais",
      "Código Civil Brasileiro - Lei 10.406/2002",
      "Consolidação das Leis do Trabalho (CLT)",
      "NR-18 - Segurança e Saúde no Trabalho na Indústria da Construção"
    ]

    // Salvar interação no banco
    const interacaoData = {
      user_id: user.id,
      contrato_id: contrato_id || null,
      pergunta: pergunta_usuario,
      resposta: aiResponse,
      contexto_contrato: contexto_contrato,
      sugestoes_geradas: sugestoes,
      tempo_resposta_ms: tempoResposta,
      modelo_ia: 'deepseek-chat',
      confianca_resposta: confianca,
      fontes_referencia: fontesReferencia
    }

    const { error: saveError } = await supabase
      .from('ia_contratos_interacoes')
      .insert([interacaoData])

    if (saveError) {
      console.error('⚠️ Erro ao salvar interação:', saveError)
      // Não falha a requisição por erro de logging
    }

    // Resposta final
    const response: ContratoAIResponse = {
      resposta: aiResponse,
      sugestoes: sugestoes,
      confianca: confianca,
      fontes_referencia: fontesReferencia,
      tempo_resposta_ms: tempoResposta
    }

    console.log(`✅ Resposta enviada em ${tempoResposta}ms com ${Math.round(confianca * 100)}% confiança`)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  })
} catch (fatalErr) {
  console.error('❌ Erro FATAL ao inicializar a função contrato-ai-assistant:', fatalErr)
  // Forçar log e CORS mesmo em erro fatal
  addEventListener('fetch', (event) => {
    event.respondWith(new Response(JSON.stringify({ erro: 'Erro FATAL ao inicializar a função contrato-ai-assistant', detalhes: String(fatalErr) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }))
  })
} 