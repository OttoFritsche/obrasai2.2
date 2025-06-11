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
  pergunta?: string;
  message?: string;
  obra_id?: string;
  usuario_id?: string;
  contexto_adicional?: string;
  incluir_sinapi?: boolean;
  incluir_orcamento?: boolean;
  incluir_despesas?: boolean;
  max_tokens?: number;
  temperatura?: number;
  pageContext?: string;
  documentationPath?: string;
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
 * Processa requisições do widget de ajuda contextual
 */
async function processarWidgetAjuda(pergunta: string, pageContext: string, documentationPath: string): Promise<Response> {
  try {
    const documentation = getDocumentationContent(documentationPath);
    
    const contextualPrompt = `
Você é um assistente IA especializado no sistema ObrasAI, especificamente no módulo de ${pageContext}.

Documentação do módulo:
${documentation}

Instruções:
1. Responda APENAS sobre funcionalidades do módulo de ${pageContext}
2. Use a documentação fornecida como base para suas respostas
3. Seja claro, objetivo e útil
4. Se a pergunta não estiver relacionada ao módulo, redirecione educadamente
5. Forneça exemplos práticos quando apropriado
6. Mantenha um tom profissional mas amigável

Pergunta do usuário: ${pergunta}

Resposta:
`;

    // Usar DeepSeek API se disponível, senão OpenAI
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API');
    
    let response;
    if (deepseekApiKey) {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente IA especializado no sistema ObrasAI. Responda sempre em português brasileiro.'
            },
            {
              role: 'user',
              content: contextualPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
    } else {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente IA especializado no sistema ObrasAI. Responda sempre em português brasileiro.'
            },
            {
              role: 'user',
              content: contextualPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
    }

    if (!response.ok) {
      throw new Error('Erro na API de IA');
    }

    const data = await response.json();
    const resposta = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta.';

    return new Response(
      JSON.stringify({ response: resposta }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no widget de ajuda:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Retorna documentação estática baseada no path
 */
function getDocumentationContent(path: string): string {
  const documentationMap: Record<string, string> = {
    '/docs/contrato/documentacao_contratoIA.md': `
# Módulo de Contratos - ObrasAI

## Funcionalidades Principais
- Criação de contratos normais e com IA
- Listagem e filtros de contratos
- Edição e edição com IA
- Envio para assinatura digital
- Download de documentos
- Gerenciamento de status

## Como Criar um Contrato
1. Clique em "Novo Contrato" ou "Criar com IA"
2. Preencha os dados básicos
3. Configure valores e condições
4. Revise e salve

## Status dos Contratos
- Rascunho: Em elaboração
- Pendente: Aguardando assinatura
- Assinado: Finalizado
- Cancelado: Cancelado
    `,
    '/docs/obras/documentacao_obras.md': `
# Módulo de Obras - ObrasAI

## Funcionalidades Principais
- Cadastro de obras
- Acompanhamento de progresso
- Controle de status
- Gestão de equipes
- Relatórios de andamento

## Como Cadastrar uma Obra
1. Clique em "Nova Obra"
2. Preencha dados básicos
3. Configure cronograma
4. Defina responsáveis
5. Salve a obra

## Status das Obras
- Planejamento: Em fase de planejamento
- Em Andamento: Obra em execução
- Pausada: Temporariamente parada
- Concluída: Obra finalizada
    `,
    '/docs/despesas/documentacao_despesas.md': `
# Módulo de Despesas - ObrasAI

## Funcionalidades Principais
- Lançamento de despesas
- Categorização automática
- Controle orçamentário
- Relatórios financeiros
- Integração com SINAPI

## Como Lançar uma Despesa
1. Clique em "Nova Despesa"
2. Selecione a obra
3. Escolha categoria
4. Informe valor e data
5. Anexe comprovantes
6. Salve o lançamento

## Categorias de Despesas
- Material: Materiais de construção
- Mão de Obra: Pagamentos de funcionários
- Equipamentos: Aluguel/compra de equipamentos
- Outros: Despesas diversas
    `,
    '/docs/orcamentoIA/documentacao_orcamento.md': `
# Módulo de Orçamentos - ObrasAI

## Funcionalidades Principais
- Criação paramétrica com IA
- Análise de composições
- Integração SINAPI
- Relatórios detalhados
- Comparativos de custos

## Como Criar um Orçamento
1. Clique em "Novo Orçamento"
2. Descreva o projeto
3. A IA analisa e sugere itens
4. Revise composições
5. Ajuste valores se necessário
6. Gere relatório final

## Análise IA
- Sugestões automáticas de itens
- Cálculo de quantitativos
- Preços baseados no SINAPI
- Alertas de inconsistências
    `
  };

  return documentationMap[path] || 'Documentação não encontrada.';
}

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
 * Busca contexto da base de conhecimento usando busca semântica
 */
async function buscarContextoConhecimento(
  pergunta: string, 
  obraId?: string
): Promise<ContextoItem[]> {
  const contextos: ContextoItem[] = [];

  try {
    // Gerar embedding da pergunta
    const queryEmbedding = await generateEmbedding(pergunta);

    // Buscar contexto relevante usando a função SQL
    const { data: contextData, error } = await supabase.rpc('buscar_contexto_conhecimento', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5
    });

    if (error) {
      console.error('Erro na busca semântica:', error);
      return contextos;
    }

    contextData?.forEach(item => {
      contextos.push({
        tipo: 'conhecimento',
        conteudo: `${item.documento} - ${item.secao}: ${item.conteudo}`,
        relevancia: item.similarity,
        fonte: 'documentacao',
        metadata: { 
          documento: item.documento,
          secao: item.secao,
          similarity: item.similarity
        }
      });
    });

  } catch (error) {
    console.error('Erro ao buscar contexto de conhecimento:', error);
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
    
    const {
      pergunta,
      message,
      obra_id,
      usuario_id,
      contexto_adicional,
      incluir_sinapi = true,
      incluir_orcamento = true,
      incluir_despesas = true,
      max_tokens = 1000,
      temperatura = 0.7,
      pageContext,
      documentationPath
    } = body;

    // Suporte ao widget de ajuda contextual
    const perguntaFinal = pergunta || message;
    
    if (!perguntaFinal) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Pergunta ou mensagem é obrigatória' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Processar requisições do widget de ajuda
    if (message && pageContext && documentationPath) {
      return await processarWidgetAjuda(message, pageContext, documentationPath);
    }

    console.log(`🤖 Processando pergunta: "${perguntaFinal}"`);
    
    // Se for uma requisição do widget de ajuda, usar documentação específica
    if (pageContext && documentationPath) {
      return await processarWidgetAjuda(perguntaFinal, pageContext, documentationPath);
    }

    // Coletar contextos relevantes
    const contextos: ContextoItem[] = [];

    // Contexto da obra específica
    if (obra_id && (incluir_orcamento || incluir_despesas)) {
      const contextoObra = await buscarContextoObra(obra_id);
      contextos.push(...contextoObra);
    }

    // Contexto da base de conhecimento
    const contextoConhecimento = await buscarContextoConhecimento(perguntaFinal, obra_id);
    contextos.push(...contextoConhecimento);

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