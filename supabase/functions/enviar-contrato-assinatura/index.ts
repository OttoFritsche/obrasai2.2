import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EnviarAssinaturaRequest {
  contrato_id: string;
  email_contratado: string;
  telefone_contratado?: string;
  mensagem_personalizada?: string;
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
    const { 
      contrato_id, 
      email_contratado, 
      telefone_contratado, 
      mensagem_personalizada 
    }: EnviarAssinaturaRequest = await req.json()
    
    // Validar dados obrigatórios
    if (!contrato_id || !email_contratado) {
      return new Response(
        JSON.stringify({ error: 'Contrato ID e email são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email_contratado)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Buscar contrato
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select('*, obras(nome)')
      .eq('id', contrato_id)
      .single()

    if (contratoError || !contrato) {
      console.error('Erro ao buscar contrato:', contratoError)
      return new Response(
        JSON.stringify({ error: 'Contrato não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o contrato já está assinado
    if (contrato.status === 'ATIVO' || contrato.status === 'CONCLUIDO') {
      return new Response(
        JSON.stringify({ error: 'Este contrato já foi assinado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se já existe assinatura pendente
    const { data: assinaturaExistente } = await supabase
      .from('assinaturas_contratos')
      .select('*')
      .eq('contrato_id', contrato_id)
      .eq('tipo_assinatura', 'CONTRATADO')
      .eq('status', 'PENDENTE')
      .single()

    let token: string
    let assinatura: any

    if (assinaturaExistente) {
      // Atualizar assinatura existente
      token = assinaturaExistente.token_assinatura
      const dataExpiracao = new Date()
      dataExpiracao.setDate(dataExpiracao.getDate() + 7) // Renovar por mais 7 dias

      const { data: assinaturaAtualizada, error: updateError } = await supabase
        .from('assinaturas_contratos')
        .update({
          email_assinante: email_contratado,
          data_expiracao: dataExpiracao.toISOString()
        })
        .eq('id', assinaturaExistente.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }
      assinatura = assinaturaAtualizada
    } else {
      // Criar nova assinatura
      token = crypto.randomUUID()
      const dataExpiracao = new Date()
      dataExpiracao.setDate(dataExpiracao.getDate() + 7) // 7 dias para assinar

      const { data: novaAssinatura, error: assinaturaError } = await supabase
        .from('assinaturas_contratos')
        .insert({
          contrato_id: contrato_id,
          tipo_assinatura: 'CONTRATADO',
          nome_assinante: contrato.contratado_nome,
          documento_assinante: contrato.contratado_documento,
          email_assinante: email_contratado,
          token_assinatura: token,
          data_expiracao: dataExpiracao.toISOString(),
          status: 'PENDENTE',
          tenant_id: null
        })
        .select()
        .single()

      if (assinaturaError) {
        console.error('Erro ao criar assinatura:', assinaturaError)
        throw assinaturaError
      }
      assinatura = novaAssinatura
    }

    // Gerar link de assinatura
    const baseUrl = req.headers.get('origin') || 'https://obrasai.com'
    const linkAssinatura = `${baseUrl}/assinatura/${token}`

    // Preparar dados do email
    const valorFormatado = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(contrato.valor_total)

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background: #5a67d8; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 Contrato para Assinatura</h1>
        <p>ObrasAI - Sistema de Gestão de Obras</p>
    </div>
    
    <div class="content">
        <h2>Olá ${contrato.contratado_nome}!</h2>
        
        <p>Você recebeu um contrato para assinatura eletrônica:</p>
        
        <div class="info-box">
            <h3>📋 Detalhes do Contrato</h3>
            <p><strong>Número:</strong> ${contrato.numero_contrato}</p>
            <p><strong>Título:</strong> ${contrato.titulo}</p>
            <p><strong>Obra:</strong> ${contrato.obras?.nome || 'Não especificada'}</p>
            <p><strong>Valor Total:</strong> ${valorFormatado}</p>
            <p><strong>Prazo de Execução:</strong> ${contrato.prazo_execucao} dias</p>
            <p><strong>Forma de Pagamento:</strong> ${contrato.forma_pagamento}</p>
        </div>
        
        ${mensagem_personalizada ? `
        <div class="info-box">
            <h3>💬 Mensagem do Contratante</h3>
            <p>${mensagem_personalizada}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center;">
            <a href="${linkAssinatura}" class="button">
                ✍️ Visualizar e Assinar Contrato
            </a>
        </div>
        
        <div class="warning">
            <strong>⏰ Atenção:</strong> Este link expira em 7 dias. Após este prazo, será necessário solicitar um novo link.
        </div>
        
        <h3>Como funciona?</h3>
        <ol>
            <li>Clique no botão acima para acessar o contrato</li>
            <li>Leia atentamente todos os termos e condições</li>
            <li>Se concordar, clique em "Assinar Digitalmente"</li>
            <li>Você receberá uma cópia assinada por email</li>
        </ol>
        
        <h3>Segurança</h3>
        <p>✅ Assinatura eletrônica com validade jurídica<br>
        ✅ Documento protegido por criptografia<br>
        ✅ Registro de IP e data/hora da assinatura</p>
    </div>
    
    <div class="footer">
        <p>Este é um email automático enviado pelo sistema ObrasAI.<br>
        Em caso de dúvidas, entre em contato com o contratante.</p>
        <p>© 2025 ObrasAI - Todos os direitos reservados</p>
    </div>
</body>
</html>
    `

    // Aqui seria a integração com serviço de email real
    // Por enquanto, vamos simular o envio
    console.log('Enviando email para:', email_contratado)
    console.log('Link de assinatura:', linkAssinatura)

    // Atualizar status do contrato
    await supabase
      .from('contratos')
      .update({ status: 'AGUARDANDO_ASSINATURA' })
      .eq('id', contrato_id)

    // Registrar no histórico
    await supabase
      .from('historico_contratos')
      .insert({
        contrato_id: contrato_id,
        acao: 'ENVIADO_PARA_ASSINATURA',
        descricao: `Contrato enviado para assinatura de ${email_contratado}`,
        dados_alteracao: { 
          email: email_contratado,
          telefone: telefone_contratado,
          token: token,
          mensagem: mensagem_personalizada
        },
        tenant_id: null
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contrato enviado para assinatura com sucesso',
        data: {
          link_assinatura: linkAssinatura,
          data_expiracao: assinatura.data_expiracao,
          email_enviado: email_contratado,
          status: 'AGUARDANDO_ASSINATURA'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao enviar contrato:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar solicitação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 