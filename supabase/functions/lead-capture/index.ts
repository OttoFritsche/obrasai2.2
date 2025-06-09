import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ✅ Headers de segurança
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// ✅ Rate limiting para prevenir spam
const rateLimiter = new Map<string, number[]>();

interface LeadData {
  email: string;
  nome?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  tipo_empresa?: 'construtora' | 'engenharia' | 'arquitetura' | 'individual' | 'outro';
  porte_empresa?: 'micro' | 'pequena' | 'media' | 'grande';
  numero_obras_mes?: number;
  principal_desafio?: string;
  como_conheceu?: string;
  interesse_nivel?: 'baixo' | 'medio' | 'alto' | 'muito_alto';
  origem?: string;
  orcamento_mensal?: number;
  previsao_inicio?: string;
  observacoes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface LeadRequest {
  lead: LeadData;
  context?: {
    page_url?: string;
    referrer?: string;
    user_agent?: string;
    ip_address?: string;
  };
}

/**
 * ✅ Implementa rate limiting para prevenir spam
 */
const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const requests = rateLimiter.get(clientId) || [];
  
  // Remove requests mais antigos que 1 hora
  const recentRequests = requests.filter(time => now - time < 3600000);
  
  // Limite: 3 leads por hora por IP
  if (recentRequests.length >= 3) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(clientId, recentRequests);
  return true;
};

/**
 * ✅ Validação e sanitização de dados
 */
const validateLead = (lead: LeadData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Email obrigatório e válido
  if (!lead.email) {
    errors.push('Email é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.push('Email inválido');
  }

  // Validações opcionais mas quando presentes devem ser válidas
  if (lead.telefone && !/^[\d\s\-()+]{10,}$/.test(lead.telefone.replace(/\s/g, ''))) {
    errors.push('Telefone inválido');
  }

  if (lead.numero_obras_mes && (lead.numero_obras_mes < 0 || lead.numero_obras_mes > 1000)) {
    errors.push('Número de obras por mês deve ser entre 0 e 1000');
  }

  if (lead.orcamento_mensal && (lead.orcamento_mensal < 0 || lead.orcamento_mensal > 100000000)) {
    errors.push('Orçamento mensal inválido');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * 📧 Notificação por email (simulada - pode integrar com SendGrid, etc)
 */
const notificarNovoLead = async (lead: LeadData): Promise<void> => {
  try {
    // Aqui você pode integrar com serviços de email como SendGrid, AWS SES, etc.
    console.log(`🎯 NOVO LEAD CAPTURADO:`, {
      email: lead.email,
      nome: lead.nome || 'Não informado',
      empresa: lead.empresa || 'Não informada',
      interesse: lead.interesse_nivel || 'medio',
      origem: lead.origem || 'landing_page'
    });

    // Exemplo de integração com webhook/Slack/Discord
    // await fetch('https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🎯 Novo lead: ${lead.nome || lead.email} - ${lead.empresa || 'Sem empresa'}`
    //   })
    // });

  } catch (error) {
    console.error('Erro ao notificar novo lead:', error);
    // Não falhar a operação por causa da notificação
  }
};

/**
 * 🧮 Calcular score de qualificação do lead
 */
const calcularScoreLead = (lead: LeadData): { score: number; prioridade: string } => {
  let score = 0;

  // Score por dados fornecidos
  if (lead.nome) score += 10;
  if (lead.telefone) score += 15;
  if (lead.empresa) score += 20;
  if (lead.cargo) score += 10;

  // Score por tipo e porte da empresa
  if (lead.tipo_empresa === 'construtora') score += 30;
  else if (lead.tipo_empresa === 'engenharia') score += 25;
  else if (lead.tipo_empresa === 'arquitetura') score += 20;

  if (lead.porte_empresa === 'grande') score += 25;
  else if (lead.porte_empresa === 'media') score += 20;
  else if (lead.porte_empresa === 'pequena') score += 15;

  // Score por volume de obras
  if (lead.numero_obras_mes) {
    if (lead.numero_obras_mes > 10) score += 30;
    else if (lead.numero_obras_mes > 5) score += 20;
    else if (lead.numero_obras_mes > 1) score += 10;
  }

  // Score por orçamento
  if (lead.orcamento_mensal) {
    if (lead.orcamento_mensal > 100000) score += 30;
    else if (lead.orcamento_mensal > 50000) score += 20;
    else if (lead.orcamento_mensal > 10000) score += 10;
  }

  // Score por interesse declarado
  if (lead.interesse_nivel === 'muito_alto') score += 25;
  else if (lead.interesse_nivel === 'alto') score += 20;
  else if (lead.interesse_nivel === 'medio') score += 10;

  // Determinar prioridade
  let prioridade = 'normal';
  if (score >= 100) prioridade = 'urgente';
  else if (score >= 70) prioridade = 'alta';
  else if (score < 30) prioridade = 'baixa';

  return { score, prioridade };
};

/**
 * 🚀 Handler principal
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Método não permitido. Use POST.');
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parsear dados da requisição
    const body = await req.json();
    const { lead, context } = body as LeadRequest;

    // Rate limiting por IP
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     context?.ip_address || 
                     'unknown';
    
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ 
          error: 'Muitas tentativas. Aguarde 1 hora.',
          type: 'rate_limit'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar dados do lead
    const { isValid, errors } = validateLead(lead);
    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos',
          details: errors
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calcular score e prioridade
    const { score, prioridade } = calcularScoreLead(lead);

    // Preparar dados para inserção
    const leadData = {
      ...lead,
      email: lead.email.toLowerCase().trim(),
      prioridade,
      ip_address: clientIp,
      user_agent: context?.user_agent || req.headers.get('user-agent'),
      origem: lead.origem || 'landing_page'
    };

    // Verificar se já existe um lead com este email
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, updated_at')
      .eq('email', leadData.email)
      .single();

    let result;

    if (existingLead) {
      // Atualizar lead existente com novos dados
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...leadData,
          interesse_nivel: lead.interesse_nivel || 'alto', // Aumentar interesse se voltou
          updated_at: new Date().toISOString()
        })
        .eq('email', leadData.email)
        .select()
        .single();

      if (error) throw error;
      result = { type: 'updated', lead: data };

    } else {
      // Criar novo lead
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;
      result = { type: 'created', lead: data };

      // Notificar apenas para novos leads
      await notificarNovoLead(lead);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: result.type === 'created' ? 'Lead cadastrado com sucesso!' : 'Informações atualizadas!',
        lead_id: result.lead.id,
        score,
        prioridade
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro no Lead Capture:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar sua solicitação. Tente novamente.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});