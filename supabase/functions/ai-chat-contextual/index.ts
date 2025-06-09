import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * 🤖 Edge Function: Chat IA Contextual
 * 
 * Sistema de chat inteligente que utiliza RAG (Retrieval Augmented Generation)
 * para responder perguntas sobre obras, orçamentos e dados SINAPI.
 * 
 * @author Pharma.AI Team
 * @endpoint POST /functions/v1/ai-chat-contextual
 */

interface ChatRequest {
  pergunta: string;
  obra_id?: string;
  usuario_id?: string;
  contexto_adicional?: string;
  incluir_sinapi?: boolean;
  incluir_orcamento?: boolean;
  incluir_despesas?: boolean;
  max_tokens?: number;
  temperatura?: number;
}

interface ContextoItem {
  tipo: 'obra' | 'orcamento' | 'despesa' | 'sinapi' | 'conhecimento';
  conteudo: string;
  relevancia: number;
  fonte: string;
  metadata?: Record<string, unknown>;
}

interface ChatResponse {
  success: boolean;
  resposta: string;
  contexto_usado: ContextoItem[];
  tokens_usados: number;
  tempo_processamento_ms: number;
  similarity_score?: number;
  sugestoes_followup?: string[];
  error?: string;
}

// Configuração
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gera embedding para busca semântica
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
      dimensions: 1536
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao gerar embedding: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Busca contexto da obra específica
 */
async function buscarContextoObra(obraId: string): Promise<ContextoItem[]> {
  const contextos: ContextoItem[] = [];

  try {
    // Dados básicos da obra
    const { data: obra } = await supabase
      .from('obras')
      .select('*')
      .eq('id', obraId)
      .single();

    if (obra) {
      contextos.push({
        tipo: 'obra',
        conteudo: `Obra: ${obra.nome}. Localização: ${obra.endereco}, ${obra.cidade}/${obra.estado}. Orçamento: R$ ${obra.orcamento}. Início: ${obra.data_inicio || 'Não definido'}. Término previsto: ${obra.data_prevista_termino || 'Não definido'}.`,
        relevancia: 1.0,
        fonte: 'dados_obra',
        metadata: { obra_id: obraId }
      });
    }

    // Orçamentos paramétricos da obra
    const { data: orcamentos } = await supabase
      .from('orcamentos_parametricos')
      .select('*')
      .eq('obra_id', obraId)
      .eq('status', 'CONCLUIDO')
      .limit(3);

    orcamentos?.forEach(orc => {
      contextos.push({
        tipo: 'orcamento',
        conteudo: `Orçamento "${orc.nome_orcamento}": Tipo ${orc.tipo_obra}, Padrão ${orc.padrao_obra}. Área: ${orc.area_total}m². Custo estimado: R$ ${orc.custo_estimado}. Custo/m²: R$ ${orc.custo_m2}. Confiança: ${orc.confianca_estimativa}%.`,
        relevancia: 0.9,
        fonte: 'orcamento_parametrico',
        metadata: { orcamento_id: orc.id }
      });
    });

    // Despesas recentes da obra
    const { data: despesas } = await supabase
      .from('despesas')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false })
      .limit(10);

    const totalDespesas = despesas?.reduce((sum, d) => sum + Number(d.custo), 0) || 0;
    const despesasPorCategoria = despesas?.reduce((acc: Record<string, number>, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + Number(d.custo);
      return acc;
    }, {} as Record<string, number>);

    if (despesas && despesas.length > 0) {
      contextos.push({
        tipo: 'despesa',
        conteudo: `Despesas da obra: Total gasto R$ ${totalDespesas.toFixed(2)}. ${despesas.length} despesas registradas. Principais categorias: ${Object.entries(despesasPorCategoria || {}).map(([cat, valor]) => `${cat}: R$ ${Number(valor).toFixed(2)}`).join(', ')}.`,
        relevancia: 0.8,
        fonte: 'despesas_obra',
        metadata: { total_despesas: totalDespesas }
      });
    }

  } catch (error) {
    console.error('Erro ao buscar contexto da obra:', error);
  }

  return contextos;
}

/**
 * Busca contexto semântico relevante
 */
async function buscarContextoSemantico(
  pergunta: string, 
  obraId?: string
): Promise<ContextoItem[]> {
  const contextos: ContextoItem[] = [];

  try {
    // Buscar na base de conhecimento
    const { data: conhecimento } = await supabase
      .from('embeddings_conhecimento')
      .select('*')
      .eq('obra_id', obraId)
      .limit(5);

    conhecimento?.forEach(item => {
      contextos.push({
        tipo: 'conhecimento',
        conteudo: `${item.titulo}: ${item.conteudo_resumido || item.conteudo.substring(0, 500)}`,
        relevancia: 0.7,
        fonte: 'base_conhecimento',
        metadata: { 
          tipo_conteudo: item.tipo_conteudo,
          referencia_id: item.referencia_id 
        }
      });
    });

  } catch (error) {
    console.error('Erro ao buscar contexto semântico:', error);
  }

  return contextos;
}

/**
 * Busca dados SINAPI relevantes
 */
async function buscarContextoSinapi(pergunta: string): Promise<ContextoItem[]> {
  const contextos: ContextoItem[] = [];

  try {
    // Busca simples por palavras-chave nos insumos SINAPI
    const palavrasChave = pergunta.toLowerCase().split(' ').filter(p => p.length > 3);
    
    if (palavrasChave.length > 0) {
      const { data: insumos } = await supabase
        .from('sinapi_insumos')
        .select('codigo_do_insumo, descricao_do_insumo, unidade, preco_sp')
        .ilike('descricao_do_insumo', `%${palavrasChave[0]}%`)
        .limit(5);

      insumos?.forEach(insumo => {
        contextos.push({
          tipo: 'sinapi',
          conteudo: `SINAPI ${insumo.codigo_do_insumo}: ${insumo.descricao_do_insumo}. Unidade: ${insumo.unidade}. Preço SP: R$ ${insumo.preco_sp || 'N/A'}.`,
          relevancia: 0.6,
          fonte: 'sinapi_insumos',
          metadata: { codigo: insumo.codigo_do_insumo }
        });
      });
    }

  } catch (error) {
    console.error('Erro ao buscar contexto SINAPI:', error);
  }

  return contextos;
}

/**
 * Gera resposta usando OpenAI GPT
 */
async function gerarResposta(
  pergunta: string,
  contextos: ContextoItem[],
  maxTokens: number = 1000,
  temperatura: number = 0.7
): Promise<{ resposta: string; tokensUsados: number }> {
  
  // Construir prompt com contexto
  const contextosTexto = contextos
    .sort((a, b) => b.relevancia - a.relevancia)
    .slice(0, 10) // Limitar contextos para não exceder limite de tokens
    .map(c => `[${c.tipo.toUpperCase()}] ${c.conteudo}`)
    .join('\n\n');

  const prompt = `Você é um assistente especializado em construção civil e orçamentos de obras. Use as informações de contexto fornecidas para responder à pergunta do usuário de forma precisa e útil.

CONTEXTO DISPONÍVEL:
${contextosTexto}

PERGUNTA DO USUÁRIO:
${pergunta}

INSTRUÇÕES:
- Responda em português brasileiro
- Use dados específicos do contexto quando disponível
- Se não houver informações suficientes no contexto, seja claro sobre isso
- Forneça respostas práticas e acionáveis
- Cite códigos SINAPI quando relevante
- Mantenha um tom profissional mas acessível

RESPOSTA:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em construção civil, orçamentos e dados SINAPI. Sempre responda em português brasileiro.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperatura,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na API OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    resposta: data.choices[0].message.content,
    tokensUsados: data.usage.total_tokens
  };
}

/**
 * Gera sugestões de follow-up
 */
function gerarSugestoesFollowup(pergunta: string, contextos: ContextoItem[]): string[] {
  const sugestoes = [
    "Pode me dar mais detalhes sobre os custos?",
    "Quais são as alternativas disponíveis?",
    "Como isso impacta o cronograma da obra?"
  ];

  // Sugestões baseadas no contexto
  if (contextos.some(c => c.tipo === 'sinapi')) {
    sugestoes.push("Existem códigos SINAPI similares?");
  }

  if (contextos.some(c => c.tipo === 'orcamento')) {
    sugestoes.push("Como isso afeta o orçamento total?");
  }

  if (contextos.some(c => c.tipo === 'despesa')) {
    sugestoes.push("Qual o histórico de gastos nesta categoria?");
  }

  return sugestoes.slice(0, 4);
}

/**
 * Salva a conversa no histórico
 */
async function salvarConversa(
  pergunta: string,
  resposta: string,
  contextos: ContextoItem[],
  tokensUsados: number,
  tempoResposta: number,
  obraId?: string,
  usuarioId?: string
) {
  try {
    await supabase
      .from('conversas_ia')
      .insert({
        usuario_id: usuarioId,
        obra_id: obraId,
        pergunta,
        resposta,
        contexto_usado: contextos.map(c => ({
          tipo: c.tipo,
          fonte: c.fonte,
          relevancia: c.relevancia
        })),
        contexto_semantico: {
          total_contextos: contextos.length,
          tipos_contexto: [...new Set(contextos.map(c => c.tipo))]
        },
        tokens_usados: tokensUsados,
        tempo_resposta_ms: tempoResposta,
        similarity_score: contextos.length > 0 ? 
          contextos.reduce((sum, c) => sum + c.relevancia, 0) / contextos.length : 0
      });
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
  }
}

/**
 * Handler principal
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body: ChatRequest = await req.json();
    
    if (!body.pergunta || body.pergunta.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Pergunta é obrigatória' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const {
      pergunta,
      obra_id,
      usuario_id,
      contexto_adicional,
      incluir_sinapi = true,
      incluir_orcamento = true,
      incluir_despesas = true,
      max_tokens = 1000,
      temperatura = 0.7
    } = body;

    console.log(`🤖 Processando pergunta: "${pergunta}"`);

    // Coletar contextos relevantes
    const contextos: ContextoItem[] = [];

    // Contexto da obra específica
    if (obra_id && (incluir_orcamento || incluir_despesas)) {
      const contextoObra = await buscarContextoObra(obra_id);
      contextos.push(...contextoObra);
    }

    // Contexto semântico
    const contextoSemantico = await buscarContextoSemantico(pergunta, obra_id);
    contextos.push(...contextoSemantico);

    // Contexto SINAPI
    if (incluir_sinapi) {
      const contextoSinapi = await buscarContextoSinapi(pergunta);
      contextos.push(...contextoSinapi);
    }

    // Contexto adicional fornecido
    if (contexto_adicional) {
      contextos.push({
        tipo: 'conhecimento',
        conteudo: contexto_adicional,
        relevancia: 0.8,
        fonte: 'contexto_adicional'
      });
    }

    console.log(`📚 Coletados ${contextos.length} contextos relevantes`);

    // Gerar resposta
    const { resposta, tokensUsados } = await gerarResposta(
      pergunta, 
      contextos, 
      max_tokens, 
      temperatura
    );

    // Gerar sugestões de follow-up
    const sugestoes = gerarSugestoesFollowup(pergunta, contextos);

    const tempoProcessamento = Date.now() - startTime;

    // Salvar conversa no histórico
    await salvarConversa(
      pergunta,
      resposta,
      contextos,
      tokensUsados,
      tempoProcessamento,
      obra_id,
      usuario_id
    );

    const response: ChatResponse = {
      success: true,
      resposta,
      contexto_usado: contextos,
      tokens_usados: tokensUsados,
      tempo_processamento_ms: tempoProcessamento,
      similarity_score: contextos.length > 0 ? 
        contextos.reduce((sum, c) => sum + c.relevancia, 0) / contextos.length : 0,
      sugestoes_followup: sugestoes
    };

    console.log(`✅ Resposta gerada em ${tempoProcessamento}ms usando ${tokensUsados} tokens`);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const tempoProcessamento = Date.now() - startTime;
    
    console.error('❌ Erro no chat IA:', error);

    const response: ChatResponse = {
      success: false,
      resposta: '',
      contexto_usado: [],
      tokens_usados: 0,
      tempo_processamento_ms: tempoProcessamento,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});