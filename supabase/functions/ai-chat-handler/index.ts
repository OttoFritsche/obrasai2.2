import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// ✅ Interfaces para tipagem
interface Obra {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  orcamento: number;
  data_inicio: string;
  data_prevista_termino: string;
}

interface Despesa {
  id: string;
  descricao: string;
  custo: number;
  data_despesa: string;
  categoria: string;
  pago: boolean;
  obra_id: string;
  fornecedores_pj?: { razao_social: string; nome_fantasia: string };
  fornecedores_pf?: { nome: string };
}

interface NotaFiscal {
  id: string;
  numero: string;
  data_emissao: string;
  obra_id: string;
}

interface ContextoObra {
  obra: {
    nome: string;
    endereco: string;
    orcamento: number;
    data_inicio: string;
    data_prevista_termino: string;
    dias_em_andamento: number;
  };
  financeiro: {
    orcamento_total: number;
    total_gasto: number;
    total_pago: number;
    total_pendente: number;
    percentual_gasto: string;
    saldo_disponivel: number;
  };
  despesas_recentes: Array<{
    descricao: string;
    valor: number;
    data: string;
    categoria: string;
    pago: boolean;
    fornecedor: string;
  }>;
  total_despesas: number;
  total_notas_fiscais: number;
}

interface ChatRequest {
  message: string;
  obra_id?: string;
  user_id: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ErrorWithCode extends Error {
  code?: string;
}

import { getSecureCorsHeaders, getPreflightHeaders, validateCSRFToken, checkRateLimit } from '../_shared/cors.ts';
import { validateObject, VALIDATION_SCHEMAS } from '../_shared/input-validation.ts';

// ✅ Headers de segurança aprimorados - agora usando configuração centralizada

// 🤖 Configuração da API DeepSeek
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Rate limiting agora é gerenciado pela configuração centralizada

// Validação CSRF agora é gerenciada pela configuração centralizada

/**
 * 🧠 Busca contexto completo da obra para a IA
 */
async function buscarContextoObra(supabase: SupabaseClient, obra_id: string): Promise<ContextoObra | null> {
  try {
    // Buscar dados da obra
    const { data: obra, error: obraError } = await supabase
      .from('obras')
      .select('*')
      .eq('id', obra_id)
      .single();

    if (obraError || !obra) {
      console.error('Erro ao buscar obra:', obraError);
      return null;
    }

    // Buscar despesas da obra
    const { data: despesas } = await supabase
      .from('despesas')
      .select(`
        *,
        fornecedores_pj (razao_social, nome_fantasia),
        fornecedores_pf (nome)
      `)
      .eq('obra_id', obra_id)
      .order('data_despesa', { ascending: false })
      .limit(10);

    // Buscar notas fiscais
    const { data: notasFiscais } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('obra_id', obra_id)
      .order('data_emissao', { ascending: false })
      .limit(5);

    // Calcular estatísticas
    const totalDespesas = despesas?.reduce((sum: number, d: Despesa) => sum + (d.custo || 0), 0) || 0;
    const despesasPagas = despesas?.filter((d: Despesa) => d.pago).reduce((sum: number, d: Despesa) => sum + (d.custo || 0), 0) || 0;
    const despesasPendentes = totalDespesas - despesasPagas;

    return {
      obra: {
        nome: obra.nome,
        endereco: `${obra.endereco}, ${obra.cidade}/${obra.estado}`,
        orcamento: obra.orcamento,
        data_inicio: obra.data_inicio,
        data_prevista_termino: obra.data_prevista_termino,
        dias_em_andamento: obra.data_inicio 
          ? Math.floor((Date.now() - new Date(obra.data_inicio).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      },
      financeiro: {
        orcamento_total: obra.orcamento,
        total_gasto: totalDespesas,
        total_pago: despesasPagas,
        total_pendente: despesasPendentes,
        percentual_gasto: obra.orcamento > 0 ? (totalDespesas / obra.orcamento * 100).toFixed(2) : '0',
        saldo_disponivel: obra.orcamento - totalDespesas
      },
      despesas_recentes: despesas?.slice(0, 5).map((d: Despesa) => ({
        descricao: d.descricao,
        valor: d.custo,
        data: d.data_despesa,
        categoria: d.categoria,
        pago: d.pago,
        fornecedor: d.fornecedores_pj?.nome_fantasia || d.fornecedores_pf?.nome || 'Não informado'
      })),
      total_despesas: despesas?.length || 0,
      total_notas_fiscais: notasFiscais?.length || 0
    };
  } catch (error) {
    console.error('Erro ao buscar contexto:', error);
    return null;
  }
}

/**
 * 🤖 Processa a mensagem com DeepSeek
 */
async function processarComDeepSeek(prompt: string, contexto: ContextoObra | null): Promise<string> {
  try {
    const systemPrompt = `Você é um assistente especializado em gestão de obras da construção civil brasileira.
    
${contexto ? `CONTEXTO DA OBRA ATUAL:
- Nome: ${contexto.obra.nome}
- Endereço: ${contexto.obra.endereco}
- Orçamento: R$ ${contexto.financeiro.orcamento_total?.toLocaleString('pt-BR')}
- Total Gasto: R$ ${contexto.financeiro.total_gasto?.toLocaleString('pt-BR')} (${contexto.financeiro.percentual_gasto}%)
- Saldo Disponível: R$ ${contexto.financeiro.saldo_disponivel?.toLocaleString('pt-BR')}
- Despesas Pendentes: R$ ${contexto.financeiro.total_pendente?.toLocaleString('pt-BR')}
- Dias em andamento: ${contexto.obra.dias_em_andamento}
- Total de despesas registradas: ${contexto.total_despesas}
- Total de notas fiscais: ${contexto.total_notas_fiscais}

DESPESAS RECENTES:
${contexto.despesas_recentes?.map(d => 
  `- ${d.descricao}: R$ ${d.valor?.toLocaleString('pt-BR')} (${d.data}) - ${d.pago ? 'PAGO' : 'PENDENTE'}`
).join('\n') || 'Nenhuma despesa registrada'}
` : 'Nenhuma obra selecionada no momento.'}

DIRETRIZES:
- Responda sempre em português brasileiro
- Use conhecimento técnico da construção civil
- Considere normas ABNT e legislação brasileira
- Seja prático, objetivo e profissional
- Forneça insights úteis baseados nos dados disponíveis
- Se não houver dados suficientes, seja honesto e sugira o que pode ser feito
- Sempre considere o contexto financeiro da obra ao dar sugestões`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API DeepSeek:', response.status, errorData);
      throw new Error(`Erro na API DeepSeek: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao processar com DeepSeek:', error);
    throw error;
  }
}

serve(async (req) => {
  const startTime = Date.now();
  const origin = req.headers.get('origin');
  const corsHeaders = getSecureCorsHeaders(origin);
  
  // ✅ Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getPreflightHeaders(origin) });
  }

  try {
    // ✅ Verificação de método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 10, 60000)) { // 10 requests por minuto
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Verificação CSRF
    const csrfToken = req.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfToken, origin)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token or unauthorized origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Validação de autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json() as ChatRequest;
    const { message, obra_id, user_id } = requestBody;

    // Validação robusta de entrada
    const validation = validateObject({ message, obra_id, user_id: user?.id }, VALIDATION_SCHEMAS.aiChat);
    
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados de entrada inválidos',
          details: validation.errors
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Usar dados sanitizados
    const sanitizedData = validation.sanitizedObject;
    const sanitizedMessage = sanitizedData.message;
    const sanitizedObraId = sanitizedData.obra_id;
    const sanitizedUserId = sanitizedData.user_id;

    // Verificar se a API key do DeepSeek está configurada
    if (!DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API key não configurada');
      return new Response(
        JSON.stringify({ 
          error: 'Serviço de IA temporariamente indisponível. Por favor, tente novamente mais tarde.' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🧠 Buscar contexto da obra se fornecido
    let contextoObra: ContextoObra | null = null;
    if (obra_id) {
      contextoObra = await buscarContextoObra(supabase, obra_id);
    }

    // 🤖 Processar com DeepSeek
    let botResponse: string;
    try {
      botResponse = await processarComDeepSeek(sanitizedMessage, contextoObra);
    } catch (error) {
      console.error('Erro ao processar com IA:', error);
      botResponse = "Desculpe, estou com dificuldades para processar sua mensagem no momento. Por favor, tente novamente em alguns instantes.";
    }

    // Inserir a mensagem e resposta no banco de dados
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        usuario_id: user_id,
        obra_id: obra_id || null,
        mensagem: sanitizedMessage,
        resposta_bot: botResponse,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Calcular métricas
    const tempoResposta = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({ 
        result: data,
        metrics: {
          tempo_resposta_ms: tempoResposta,
          contexto_usado: !!contextoObra,
          obra_nome: contextoObra?.obra?.nome || null
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // ✅ Log seguro de erro
    const errorWithCode = error as ErrorWithCode;
    console.error('AI chat handler error:', {
      timestamp: new Date().toISOString(),
      errorCode: errorWithCode?.code,
      hasMessage: !!errorWithCode?.message,
      error: errorWithCode?.message || 'Unknown error'
    });
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
