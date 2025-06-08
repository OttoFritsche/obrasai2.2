import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface GerarPDFRequest {
  contrato_id: string;
  preview_mode?: boolean;
}

interface ContratoData {
  id: string;
  numero_contrato: string;
  titulo: string;
  descricao_servicos: string;
  contratante_nome: string;
  contratante_documento: string;
  contratado_nome: string;
  contratado_documento: string;
  valor_total: number;
  forma_pagamento: string;
  data_inicio: string;
  prazo_execucao: number;
  clausulas_especiais?: string;
  observacoes?: string;
  obras?: { nome: string; endereco: string; cidade: string; estado: string };
  templates_contratos?: { template_html: string; clausulas_obrigatorias: any[] };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contrato_id, preview_mode = false }: GerarPDFRequest = await req.json()
    
    // Validar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar dados do contrato com relacionamentos
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select(`
        *,
        obras!inner(nome, endereco, cidade, estado),
        templates_contratos!inner(template_html, clausulas_obrigatorias)
      `)
      .eq('id', contrato_id)
      .single()

    if (contratoError || !contrato) {
      console.error('Erro ao buscar contrato:', contratoError)
      return new Response(
        JSON.stringify({ error: 'Contrato não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const contratoTyped = contrato as ContratoData

    // Processar template HTML
    let htmlContent = contratoTyped.templates_contratos?.template_html || ''
    
    // Preparar variáveis para substituição
    const variables = {
      numero_contrato: contratoTyped.numero_contrato,
      titulo: contratoTyped.titulo,
      descricao_servicos: contratoTyped.descricao_servicos || '',
      'contratante_nome': contratoTyped.contratante_nome || '',
      'contratante_documento': contratoTyped.contratante_documento || '',
      'contratado_nome': contratoTyped.contratado_nome || '',
      'contratado_documento': contratoTyped.contratado_documento || '',
      valor_total: new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(contratoTyped.valor_total),
      forma_pagamento: contratoTyped.forma_pagamento,
      data_inicio: contratoTyped.data_inicio ? 
        new Date(contratoTyped.data_inicio).toLocaleDateString('pt-BR') : '',
      prazo_execucao: contratoTyped.prazo_execucao,
      local_execucao: `${contratoTyped.obras?.cidade}/${contratoTyped.obras?.estado}` || '',
      data_atual: new Date().toLocaleDateString('pt-BR'),
      obra_nome: contratoTyped.obras?.nome || '',
      obra_endereco: contratoTyped.obras ? 
        `${contratoTyped.obras.endereco}, ${contratoTyped.obras.cidade}/${contratoTyped.obras.estado}` : ''
    }

    // Processar cláusulas obrigatórias
    if (contratoTyped.templates_contratos?.clausulas_obrigatorias) {
      const clausulasHtml = contratoTyped.templates_contratos.clausulas_obrigatorias
        .map((clausula: string) => `<li>${clausula}</li>`)
        .join('\n')
      variables['clausulas_obrigatorias'] = clausulasHtml
    }

    // Substituir todas as variáveis {{variavel}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      htmlContent = htmlContent.replace(regex, String(value || ''))
    }

    // Adicionar cláusulas especiais se existirem
    if (contratoTyped.clausulas_especiais) {
      const clausulasEspeciaisHtml = `
        <h3>CLÁUSULAS ESPECIAIS</h3>
        <div>${contratoTyped.clausulas_especiais}</div>
      `
      // Inserir antes das assinaturas
      htmlContent = htmlContent.replace('</body>', `${clausulasEspeciaisHtml}</body>`)
    }

    // Se for modo preview, retornar apenas o HTML
    if (preview_mode) {
      return new Response(
        JSON.stringify({
          success: true,
          html: htmlContent,
          preview: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gerar hash do documento
    const encoder = new TextEncoder()
    const data = encoder.encode(htmlContent)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashDocumento = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Gerar PDF usando jsPDF
    const fileName = `contrato_${contrato_id}_${Date.now()}.pdf`
    
    // Converter HTML para PDF simples
    const pdfContent = await gerarPDFSimples(htmlContent, contratoTyped)
    
    // Criar blob do PDF
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' })
    
    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contratos')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Erro no upload para Storage:', uploadError)
      
      // Atualizar contrato apenas com hash (sem URL)
      await supabase
        .from('contratos')
        .update({
          hash_documento: hashDocumento
        })
        .eq('id', contrato_id)

      // Registrar erro no histórico
      await supabase
        .from('historico_contratos')
        .insert({
          contrato_id: contrato_id,
          acao: 'ERRO_UPLOAD_DOCUMENTO',
          descricao: `Erro no upload: ${uploadError.message}`,
          dados_alteracao: { 
            erro: uploadError.message,
            hash: hashDocumento
          }
        })

      return new Response(
        JSON.stringify({
          success: true,
          hash_documento: hashDocumento,
          formato: 'html',
          erro_upload: true,
          mensagem: 'Documento gerado mas houve erro no upload. Tente novamente.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('contratos')
      .getPublicUrl(fileName)

    // Atualizar contrato com URL do documento
    const { error: updateError } = await supabase
      .from('contratos')
      .update({
        url_documento: urlData.publicUrl,
        hash_documento: hashDocumento
      })
      .eq('id', contrato_id)

    if (updateError) {
      console.error('Erro ao atualizar contrato:', updateError)
    }

    // Registrar no histórico
    await supabase
      .from('historico_contratos')
      .insert({
        contrato_id: contrato_id,
        acao: 'DOCUMENTO_GERADO',
        descricao: 'Documento do contrato gerado com sucesso',
        dados_alteracao: { 
          hash: hashDocumento,
          formato: 'pdf'
        }
      })

    return new Response(
              JSON.stringify({
          success: true,
          pdf_url: urlData.publicUrl,
          hash_documento: hashDocumento,
          formato: 'pdf',
          nota: 'Documento PDF gerado com sucesso'
        }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na geração de documento:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Função para gerar PDF simples a partir do HTML
async function gerarPDFSimples(htmlContent: string, contrato: ContratoData): Promise<Uint8Array> {
  // Import jsPDF dinamicamente
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  
  const doc = new jsPDF()
  
  // Configurações do PDF
  doc.setFont('helvetica', 'normal')
  
  // Título
  doc.setFontSize(16)
  doc.text('CONTRATO DE SERVIÇOS DE ACABAMENTO', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Contrato nº: ${contrato.numero_contrato}`, 20, 35)
  
  let yPosition = 50
  
  // Dados das partes
  doc.setFontSize(10)
  doc.text('CONTRATANTE:', 20, yPosition)
  yPosition += 8
  doc.text(`${contrato.contratante_nome} - ${contrato.contratante_documento}`, 25, yPosition)
  yPosition += 15
  
  doc.text('CONTRATADO:', 20, yPosition)
  yPosition += 8
  doc.text(`${contrato.contratado_nome} - ${contrato.contratado_documento}`, 25, yPosition)
  yPosition += 15
  
  // Objeto do contrato
  doc.setFontSize(12)
  doc.text('CLÁUSULA 1ª - DO OBJETO', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  const descricaoLines = doc.splitTextToSize(contrato.descricao_servicos || 'Serviços de construção', 170)
  doc.text(descricaoLines, 20, yPosition)
  yPosition += descricaoLines.length * 6 + 10
  
  // Valor
  doc.setFontSize(12)
  doc.text('CLÁUSULA 2ª - DO VALOR E PAGAMENTO', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  const valorFormatado = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(contrato.valor_total)
  
  doc.text(`Valor total: ${valorFormatado}`, 20, yPosition)
  yPosition += 8
  doc.text(`Forma de pagamento: ${contrato.forma_pagamento || 'A combinar'}`, 20, yPosition)
  yPosition += 15
  
  // Prazo
  doc.setFontSize(12)
  doc.text('CLÁUSULA 3ª - DO PRAZO', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  doc.text(`Prazo de execução: ${contrato.prazo_execucao} dias`, 20, yPosition)
  yPosition += 8
  
  if (contrato.data_inicio) {
    const dataInicio = new Date(contrato.data_inicio).toLocaleDateString('pt-BR')
    doc.text(`Data de início: ${dataInicio}`, 20, yPosition)
    yPosition += 8
  }
  
  // Obra vinculada
  if (contrato.obras) {
    yPosition += 10
    doc.setFontSize(12)
    doc.text('CLÁUSULA 4ª - DO LOCAL DE EXECUÇÃO', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Obra: ${contrato.obras.nome}`, 20, yPosition)
    yPosition += 8
    doc.text(`Endereço: ${contrato.obras.endereco}, ${contrato.obras.cidade}/${contrato.obras.estado}`, 20, yPosition)
    yPosition += 15
  }
  
  // Cláusulas especiais
  if (contrato.clausulas_especiais) {
    doc.setFontSize(12)
    doc.text('CLÁUSULAS ESPECIAIS', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    const clausulasLines = doc.splitTextToSize(contrato.clausulas_especiais, 170)
    doc.text(clausulasLines, 20, yPosition)
    yPosition += clausulasLines.length * 6 + 15
  }
  
  // Assinaturas
  if (yPosition > 250) {
    doc.addPage()
    yPosition = 30
  }
  
  yPosition += 20
  doc.setFontSize(10)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition)
  yPosition += 30
  
  // Linhas de assinatura
  doc.line(20, yPosition, 90, yPosition)
  doc.line(110, yPosition, 180, yPosition)
  yPosition += 8
  
  doc.text('CONTRATANTE', 35, yPosition)
  doc.text('CONTRATADO', 130, yPosition)
  
  // Retornar como Uint8Array
  return new Uint8Array(doc.output('arraybuffer'))
} 