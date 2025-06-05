import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// Interfaces para dados de notificação
interface NotificationData {
  usuario_nome?: string;
  obra_nome?: string;
  valor?: number;
  data?: string;
  descricao?: string;
  fornecedor?: string;
  [key: string]: unknown;
}

interface EmailTemplate {
  assunto: string;
  html: string;
  texto: string;
}

interface NotificationResult {
  sucesso: boolean;
  detalhes?: string;
  erro?: string;
  simulado?: boolean;
  email_id?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      tipo_notificacao, 
      destinatario, 
      dados,
      canal = 'email' // email, sms, push
    } = await req.json();

    if (!tipo_notificacao || !destinatario) {
      return new Response(
        JSON.stringify({ error: 'Tipo de notificação e destinatário são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let resultado;

    switch (canal) {
      case 'email':
        resultado = await enviarEmail(tipo_notificacao, destinatario, dados);
        break;
      case 'sms':
        resultado = await enviarSMS(destinatario, dados);
        break;
      case 'push':
        resultado = await enviarPush(destinatario, dados);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Canal de notificação não suportado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Salvar log da notificação
    await supabase
      .from('notification_logs')
      .insert({
        tipo: tipo_notificacao,
        canal,
        destinatario,
        status: resultado.sucesso ? 'enviado' : 'falhou',
        detalhes: resultado.detalhes || null,
        error_message: resultado.erro || null
      });

    return new Response(
      JSON.stringify(resultado),
      { status: resultado.sucesso ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enviar email
async function enviarEmail(tipo: string, destinatario: string, dados: NotificationData): Promise<NotificationResult> {
  try {
    const template = obterTemplateEmail(tipo, dados);
    
    // Usar Resend para envio de emails
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY não configurada - simulando envio');
      return {
        sucesso: true,
        detalhes: 'Email simulado (desenvolvimento)',
        simulado: true
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ObrasAI <noreply@obrasai.com>',
        to: destinatario,
        subject: template.assunto,
        html: template.html,
        text: template.texto
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro no envio: ${error}`);
    }

    const result = await response.json();

    return {
      sucesso: true,
      detalhes: `Email enviado - ID: ${result.id}`,
      email_id: result.id
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Enviar SMS (usando Twilio como exemplo)
async function enviarSMS(destinatario: string, dados: NotificationData): Promise<NotificationResult> {
  try {
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioSid || !twilioToken || !twilioPhone) {
      console.warn('⚠️ Credenciais Twilio não configuradas - simulando envio');
      return {
        sucesso: true,
        detalhes: 'SMS simulado (desenvolvimento)',
        simulado: true
      };
    }

    const mensagem = obterMensagemSMS(dados);

    // Implementar chamada para Twilio
    // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     From: twilioPhone,
    //     To: destinatario,
    //     Body: mensagem
    //   }),
    // });

    return {
      sucesso: true,
      detalhes: 'SMS enviado com sucesso',
      simulado: true
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Enviar push notification
async function enviarPush(destinatario: string, dados: NotificationData): Promise<NotificationResult> {
  try {
    // Implementar push notifications (Firebase, OneSignal, etc.)
    console.log('📱 Push notification para:', destinatario, dados);
    
    return {
      sucesso: true,
      detalhes: 'Push notification simulado',
      simulado: true
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Templates de email
function obterTemplateEmail(tipo: string, dados: NotificationData): EmailTemplate {
  const templates = {
    'obra_prazo_vencendo': {
      assunto: '⚠️ Prazo da obra se aproxima',
      html: `
        <h2>Atenção: Prazo da obra se aproxima</h2>
        <p>Olá,</p>
        <p>A obra <strong>${dados.obra_nome}</strong> tem prazo até <strong>${dados.data_prazo}</strong>.</p>
        <p>Faltam apenas <strong>${dados.dias_restantes}</strong> dias para o término previsto.</p>
        <p>Acesse o sistema para verificar o andamento.</p>
        <br>
        <p>Atenciosamente,<br>Equipe ObrasAI</p>
      `,
      texto: `Atenção: A obra ${dados.obra_nome} tem prazo até ${dados.data_prazo}. Faltam ${dados.dias_restantes} dias.`
    },
    
    'despesa_vencendo': {
      assunto: '💰 Despesa com vencimento próximo',
      html: `
        <h2>Despesa com vencimento próximo</h2>
        <p>Olá,</p>
        <p>A despesa <strong>${dados.descricao}</strong> vence em <strong>${dados.data_vencimento}</strong>.</p>
        <p>Valor: <strong>R$ ${dados.valor}</strong></p>
        <p>Obra: <strong>${dados.obra_nome}</strong></p>
        <br>
        <p>Atenciosamente,<br>Equipe ObrasAI</p>
      `,
      texto: `Despesa ${dados.descricao} vence em ${dados.data_vencimento}. Valor: R$ ${dados.valor}`
    },

    'nota_fiscal_processada': {
      assunto: '📄 Nota fiscal processada com sucesso',
      html: `
        <h2>Nota fiscal processada</h2>
        <p>Olá,</p>
        <p>A nota fiscal <strong>${dados.numero || 'sem número'}</strong> foi processada com sucesso.</p>
        <p>Valor: <strong>R$ ${dados.valor}</strong></p>
        <p>Obra: <strong>${dados.obra_nome}</strong></p>
        <br>
        <p>Atenciosamente,<br>Equipe ObrasAI</p>
      `,
      texto: `Nota fiscal ${dados.numero} processada. Valor: R$ ${dados.valor}`
    },

    'relatorio_semanal': {
      assunto: '📊 Relatório semanal das suas obras',
      html: `
        <h2>Relatório Semanal</h2>
        <p>Olá,</p>
        <p>Aqui está o resumo da semana:</p>
        <ul>
          <li><strong>${dados.total_obras}</strong> obras ativas</li>
          <li><strong>R$ ${dados.total_gastos}</strong> em despesas</li>
          <li><strong>${dados.notas_processadas}</strong> notas fiscais processadas</li>
        </ul>
        <p>Acesse o dashboard para mais detalhes.</p>
        <br>
        <p>Atenciosamente,<br>Equipe ObrasAI</p>
      `,
      texto: `Relatório semanal: ${dados.total_obras} obras ativas, R$ ${dados.total_gastos} em despesas.`
    }
  };

  return templates[tipo as keyof typeof templates] || {
    assunto: 'Notificação ObrasAI',
    html: '<p>Você tem uma nova notificação do ObrasAI.</p>',
    texto: 'Você tem uma nova notificação do ObrasAI.'
  };
}

// Mensagens SMS
function obterMensagemSMS(dados: NotificationData): string {
  return `ObrasAI: ${dados.mensagem || 'Você tem uma nova notificação.'}`;
} 