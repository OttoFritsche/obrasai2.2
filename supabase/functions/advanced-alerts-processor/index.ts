import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertaDesvio {
  id: string;
  obra_id: string;
  tipo_alerta: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  percentual_desvio: number;
  valor_orcado: number;
  valor_realizado: number;
  valor_desvio: number;
  categoria?: string;
  etapa?: string;
  descricao: string;
  status: string;
  tenant_id?: string;
}

interface ConfiguracaoAlerta {
  id: string;
  obra_id: string;
  usuario_id: string;
  tenant_id?: string;
  threshold_baixo: number;
  threshold_medio: number;
  threshold_alto: number;
  threshold_critico: number;
  notificar_email: boolean;
  notificar_dashboard: boolean;
  notificar_webhook: boolean;
  webhook_url?: string;
  ativo: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, alerta_id, obra_id, usuario_id } = await req.json()

    switch (action) {
      case 'process_new_alert':
        return await processNewAlert(supabaseClient, alerta_id)
      
      case 'send_notifications':
        return await sendNotifications(supabaseClient, alerta_id)
      
      case 'check_thresholds':
        return await checkThresholds(supabaseClient, obra_id)
      
      case 'process_webhook':
        return await processWebhook(supabaseClient, alerta_id)
      
      case 'mark_notification_read':
        return await markNotificationRead(supabaseClient, alerta_id, usuario_id)
      
      default:
        throw new Error('Ação não reconhecida')
    }
  } catch (error) {
    console.error('Erro no processamento de alertas avançados:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processNewAlert(supabaseClient: any, alertaId: string) {
  // Buscar o alerta
  const { data: alerta, error: alertaError } = await supabaseClient
    .from('alertas_desvio')
    .select('*')
    .eq('id', alertaId)
    .single()

  if (alertaError) throw alertaError

  // Buscar configurações de alerta para a obra
  const { data: configuracoes, error: configError } = await supabaseClient
    .from('configuracoes_alerta_avancadas')
    .select('*')
    .eq('obra_id', alerta.obra_id)
    .eq('ativo', true)

  if (configError) throw configError

  // Registrar no histórico
  await registrarHistorico(supabaseClient, alerta, 'CRIADO')

  // Processar notificações para cada configuração
  for (const config of configuracoes) {
    await criarNotificacoes(supabaseClient, alerta, config)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Alerta processado com sucesso',
      notificacoes_criadas: configuracoes.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function criarNotificacoes(supabaseClient: any, alerta: AlertaDesvio, config: ConfiguracaoAlerta) {
  const notificacoes = []

  // Notificação no dashboard
  if (config.notificar_dashboard) {
    notificacoes.push({
      alerta_id: alerta.id,
      usuario_id: config.usuario_id,
      tenant_id: config.tenant_id,
      tipo_notificacao: 'DASHBOARD',
      titulo: `Alerta de Desvio ${alerta.tipo_alerta}`,
      mensagem: `Desvio de ${alerta.percentual_desvio.toFixed(2)}% detectado na obra`,
      dados_extras: {
        obra_id: alerta.obra_id,
        valor_desvio: alerta.valor_desvio,
        categoria: alerta.categoria,
        etapa: alerta.etapa
      }
    })
  }

  // Notificação por email
  if (config.notificar_email) {
    notificacoes.push({
      alerta_id: alerta.id,
      usuario_id: config.usuario_id,
      tenant_id: config.tenant_id,
      tipo_notificacao: 'EMAIL',
      titulo: `ObrasAI - Alerta de Desvio Orçamentário`,
      mensagem: `Um desvio de ${alerta.percentual_desvio.toFixed(2)}% foi detectado. Valor do desvio: R$ ${alerta.valor_desvio.toFixed(2)}`,
      dados_extras: {
        obra_id: alerta.obra_id,
        template: 'alerta_desvio',
        prioridade: alerta.tipo_alerta
      }
    })
  }

  // Notificação por webhook
  if (config.notificar_webhook && config.webhook_url) {
    notificacoes.push({
      alerta_id: alerta.id,
      usuario_id: config.usuario_id,
      tenant_id: config.tenant_id,
      tipo_notificacao: 'WEBHOOK',
      titulo: 'Webhook Alert',
      mensagem: 'Budget deviation detected',
      dados_extras: {
        webhook_url: config.webhook_url,
        payload: {
          alert_type: alerta.tipo_alerta,
          deviation_percentage: alerta.percentual_desvio,
          deviation_amount: alerta.valor_desvio,
          obra_id: alerta.obra_id,
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  // Inserir todas as notificações
  if (notificacoes.length > 0) {
    const { error } = await supabaseClient
      .from('notificacoes_alertas')
      .insert(notificacoes)

    if (error) throw error
  }
}

async function sendNotifications(supabaseClient: any, alertaId: string) {
  // Buscar notificações pendentes
  const { data: notificacoes, error } = await supabaseClient
    .from('notificacoes_alertas')
    .select('*')
    .eq('alerta_id', alertaId)
    .eq('status', 'PENDENTE')
    .lt('tentativas', 3)

  if (error) throw error

  let enviadas = 0
  let erros = 0

  for (const notificacao of notificacoes) {
    try {
      switch (notificacao.tipo_notificacao) {
        case 'EMAIL':
          await enviarEmail(supabaseClient, notificacao)
          break
        case 'WEBHOOK':
          await enviarWebhook(supabaseClient, notificacao)
          break
        case 'DASHBOARD':
          // Dashboard notifications são marcadas como enviadas imediatamente
          await marcarNotificacaoEnviada(supabaseClient, notificacao.id)
          break
      }
      enviadas++
    } catch (error) {
      console.error(`Erro ao enviar notificação ${notificacao.id}:`, error)
      await marcarNotificacaoErro(supabaseClient, notificacao.id, error.message)
      erros++
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      enviadas, 
      erros,
      total: notificacoes.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function enviarEmail(supabaseClient: any, notificacao: any) {
  // Buscar dados do usuário
  const { data: usuario, error: userError } = await supabaseClient.auth.admin.getUserById(notificacao.usuario_id)
  if (userError) throw userError

  // Aqui você integraria com seu provedor de email (SendGrid, Resend, etc.)
  // Por enquanto, apenas simulamos o envio
  console.log(`Enviando email para ${usuario.user.email}:`, notificacao.titulo)
  
  await marcarNotificacaoEnviada(supabaseClient, notificacao.id)
}

async function enviarWebhook(supabaseClient: any, notificacao: any) {
  const webhookUrl = notificacao.dados_extras.webhook_url
  const payload = notificacao.dados_extras.payload

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ObrasAI-Alerts/1.0'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }

  await marcarNotificacaoEnviada(supabaseClient, notificacao.id)
}

async function marcarNotificacaoEnviada(supabaseClient: any, notificacaoId: string) {
  await supabaseClient
    .from('notificacoes_alertas')
    .update({ 
      status: 'ENVIADA', 
      enviada_em: new Date().toISOString() 
    })
    .eq('id', notificacaoId)
}

async function marcarNotificacaoErro(supabaseClient: any, notificacaoId: string, erro: string) {
  await supabaseClient
    .from('notificacoes_alertas')
    .update({ 
      status: 'ERRO',
      tentativas: supabaseClient.raw('tentativas + 1'),
      dados_extras: supabaseClient.raw(`dados_extras || '${JSON.stringify({ ultimo_erro: erro })}'::jsonb`)
    })
    .eq('id', notificacaoId)
}

async function checkThresholds(supabaseClient: any, obraId: string) {
  // Buscar configurações ativas para a obra
  const { data: configuracoes, error } = await supabaseClient
    .from('configuracoes_alerta_avancadas')
    .select('*')
    .eq('obra_id', obraId)
    .eq('ativo', true)

  if (error) throw error

  // Calcular desvios atuais
  const desvios = await calcularDesviosObra(supabaseClient, obraId)
  
  let alertasGerados = 0

  for (const config of configuracoes) {
    for (const desvio of desvios) {
      const tipoAlerta = determinarTipoAlerta(desvio.percentual, config)
      
      if (tipoAlerta) {
        // Verificar se já existe alerta ativo para esta situação
        const { data: alertaExistente } = await supabaseClient
          .from('alertas_desvio')
          .select('id')
          .eq('obra_id', obraId)
          .eq('categoria', desvio.categoria)
          .eq('status', 'ATIVO')
          .single()

        if (!alertaExistente) {
          // Criar novo alerta
          const novoAlerta = {
            obra_id: obraId,
            tipo_alerta: tipoAlerta,
            percentual_desvio: desvio.percentual,
            valor_orcado: desvio.valor_orcado,
            valor_realizado: desvio.valor_realizado,
            valor_desvio: desvio.valor_desvio,
            categoria: desvio.categoria,
            descricao: `Desvio de ${desvio.percentual.toFixed(2)}% na categoria ${desvio.categoria}`,
            status: 'ATIVO',
            tenant_id: config.tenant_id
          }

          const { data: alertaCriado, error: alertaError } = await supabaseClient
            .from('alertas_desvio')
            .insert(novoAlerta)
            .select()
            .single()

          if (!alertaError) {
            alertasGerados++
            // Processar o novo alerta
            await processNewAlert(supabaseClient, alertaCriado.id)
          }
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      alertas_gerados: alertasGerados,
      desvios_analisados: desvios.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function determinarTipoAlerta(percentual: number, config: ConfiguracaoAlerta): string | null {
  if (percentual >= config.threshold_critico) return 'CRITICO'
  if (percentual >= config.threshold_alto) return 'ALTO'
  if (percentual >= config.threshold_medio) return 'MEDIO'
  if (percentual >= config.threshold_baixo) return 'BAIXO'
  return null
}

async function calcularDesviosObra(supabaseClient: any, obraId: string) {
  // Buscar orçamento e despesas da obra
  const { data: orcamento } = await supabaseClient
    .from('orcamento')
    .select('*')
    .eq('obra_id', obraId)

  const { data: despesas } = await supabaseClient
    .from('despesas')
    .select('*')
    .eq('obra_id', obraId)

  // Agrupar por categoria e calcular desvios
  const desviosPorCategoria = []
  const categorias = [...new Set(orcamento?.map(item => item.categoria) || [])]

  for (const categoria of categorias) {
    const orcadoCategoria = orcamento
      ?.filter(item => item.categoria === categoria)
      .reduce((sum, item) => sum + (item.custo || 0), 0) || 0

    const realizadoCategoria = despesas
      ?.filter(item => item.categoria === categoria)
      .reduce((sum, item) => sum + (item.custo || 0), 0) || 0

    if (orcadoCategoria > 0) {
      const percentualDesvio = ((realizadoCategoria - orcadoCategoria) / orcadoCategoria) * 100
      
      if (Math.abs(percentualDesvio) >= 5) { // Só considera desvios >= 5%
        desviosPorCategoria.push({
          categoria,
          percentual: Math.abs(percentualDesvio),
          valor_orcado: orcadoCategoria,
          valor_realizado: realizadoCategoria,
          valor_desvio: realizadoCategoria - orcadoCategoria
        })
      }
    }
  }

  return desviosPorCategoria
}

async function processWebhook(supabaseClient: any, alertaId: string) {
  // Implementar processamento específico de webhooks se necessário
  return new Response(
    JSON.stringify({ success: true, message: 'Webhook processado' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function markNotificationRead(supabaseClient: any, alertaId: string, usuarioId: string) {
  const { error } = await supabaseClient
    .from('notificacoes_alertas')
    .update({ 
      status: 'LIDA', 
      lida_em: new Date().toISOString() 
    })
    .eq('alerta_id', alertaId)
    .eq('usuario_id', usuarioId)
    .eq('tipo_notificacao', 'DASHBOARD')

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Notificação marcada como lida' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function registrarHistorico(supabaseClient: any, alerta: AlertaDesvio, acao: string) {
  await supabaseClient
    .from('historico_alertas')
    .insert({
      alerta_id: alerta.id,
      obra_id: alerta.obra_id,
      tenant_id: alerta.tenant_id,
      tipo_alerta: alerta.tipo_alerta,
      percentual_desvio: alerta.percentual_desvio,
      valor_orcado: alerta.valor_orcado,
      valor_realizado: alerta.valor_realizado,
      valor_desvio: alerta.valor_desvio,
      acao
    })
}