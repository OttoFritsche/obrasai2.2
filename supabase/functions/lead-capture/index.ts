import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// ✅ Headers de segurança
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// ✅ Rate limiting para prevenir spam
const rateLimiter = new Map<string, number[]>();

// ✅ Schema de validação com Zod
const leadSchema = z.object({
  email: z.string({ required_error: "Email é obrigatório" }).email({
    message: "Formato de email inválido",
  }),
  nome: z.string().optional(),
  telefone: z.string().min(10, {
    message: "Telefone deve ter no mínimo 10 dígitos",
  }).optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  tipo_empresa: z.enum([
    "construtora",
    "engenharia",
    "arquitetura",
    "individual",
    "outro",
  ]).optional(),
  porte_empresa: z.enum(["micro", "pequena", "media", "grande"]).optional(),
  numero_obras_mes: z.number().min(0, "Valor deve ser positivo").max(
    1000,
    "Valor excede o limite",
  ).optional(),
  principal_desafio: z.string().optional(),
  como_conheceu: z.string().optional(),
  interesse_nivel: z.enum(["baixo", "medio", "alto", "muito_alto"]).optional(),
  origem: z.string().optional(),
  orcamento_mensal: z.number().min(0, "Valor deve ser positivo").max(
    100000000,
    "Valor excede o limite",
  ).optional(),
  previsao_inicio: z.string().optional(),
  observacoes: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

// O tipo é inferido a partir do schema Zod
type LeadData = z.infer<typeof leadSchema>;

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
  const recentRequests = requests.filter((time) => now - time < 3600000);

  // Limite: 3 leads por hora por IP
  if (recentRequests.length >= 3) {
    return false;
  }

  recentRequests.push(now);
  rateLimiter.set(clientId, recentRequests);
  return true;
};

/**
 * 🧮 Calcular score de qualificação do lead
 */
const calcularScoreLead = (
  lead: LeadData,
): { score: number; prioridade: string } => {
  let score = 0;

  // Score por dados fornecidos
  if (lead.nome) score += 10;
  if (lead.telefone) score += 15;
  if (lead.empresa) score += 20;
  if (lead.cargo) score += 10;

  // Score por tipo e porte da empresa
  if (lead.tipo_empresa === "construtora") score += 30;
  else if (lead.tipo_empresa === "engenharia") score += 25;
  else if (lead.tipo_empresa === "arquitetura") score += 20;

  if (lead.porte_empresa === "grande") score += 25;
  else if (lead.porte_empresa === "media") score += 20;
  else if (lead.porte_empresa === "pequena") score += 15;

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
  if (lead.interesse_nivel === "muito_alto") score += 25;
  else if (lead.interesse_nivel === "alto") score += 20;
  else if (lead.interesse_nivel === "medio") score += 10;

  // Determinar prioridade
  let prioridade = "normal";
  if (score >= 100) prioridade = "urgente";
  else if (score >= 70) prioridade = "alta";
  else if (score < 30) prioridade = "baixa";

  return { score, prioridade };
};

/**
 * 📧 Notificação por email (simulada - pode integrar com SendGrid, etc)
 */
const notificarNovoLead = async (lead: LeadData): Promise<void> => {
  try {
    // Aqui você pode integrar com serviços de email como SendGrid, AWS SES, etc.
    console.log(`🎯 NOVO LEAD CAPTURADO:`, {
      email: lead.email,
      nome: lead.nome || "Não informado",
      empresa: lead.empresa || "Não informada",
      interesse: lead.interesse_nivel || "medio",
      origem: lead.origem || "landing_page",
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
    console.error("Erro ao notificar novo lead:", error);
    // Não falhar a operação por causa da notificação
  }
};

/**
 * 🚀 Handler principal
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Método não permitido. Use POST.");
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parsear dados da requisição
    const body = await req.json();
    const { lead, context } = body as LeadRequest;

    // Rate limiting por IP
    const clientIp = req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      context?.ip_address ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({
          error: "Muitas tentativas. Aguarde 1 hora.",
          type: "rate_limit",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validar dados do lead com Zod
    const validationResult = leadSchema.safeParse(lead);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Dados inválidos",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Usar os dados validados e sanitizados pelo Zod
    const validatedLead = validationResult.data;

    // Calcular score e prioridade
    const { score, prioridade } = calcularScoreLead(validatedLead);

    // Preparar dados para inserção
    const leadData = {
      ...validatedLead,
      email: validatedLead.email.toLowerCase().trim(),
      prioridade,
      ip_address: clientIp,
      user_agent: context?.user_agent || req.headers.get("user-agent"),
      origem: validatedLead.origem || "landing_page",
    };

    // Verificar se já existe um lead com este email
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id, email, updated_at")
      .eq("email", leadData.email)
      .single();

    let result;

    if (existingLead) {
      // Atualizar lead existente com novos dados
      const { data, error } = await supabase
        .from("leads")
        .update({
          ...leadData,
          interesse_nivel: validatedLead.interesse_nivel || "alto", // Aumentar interesse se voltou
          updated_at: new Date().toISOString(),
        })
        .eq("email", leadData.email)
        .select()
        .single();

      if (error) throw error;
      result = { type: "updated", lead: data };
    } else {
      // Criar novo lead
      const { data, error } = await supabase
        .from("leads")
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;
      result = { type: "created", lead: data };

      // Notificar apenas para novos leads
      await notificarNovoLead(validatedLead);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: result.type === "created"
          ? "Lead cadastrado com sucesso!"
          : "Informações atualizadas!",
        lead_id: result.lead.id,
        score,
        prioridade,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Erro no Lead Capture:", error);

    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        message: "Não foi possível processar sua solicitação. Tente novamente.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
