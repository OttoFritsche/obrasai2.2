import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API')

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para gerar embedding usando DeepSeek
async function gerarEmbedding(texto: string): Promise<number[]> {
  // IMPORTANTE: Em produção, substitua por um provedor real de embeddings
  // Opções recomendadas: OpenAI, Cohere, Hugging Face, ou Sentence Transformers
  
  // Para desenvolvimento: gerar embedding determinístico baseado no hash do texto
  // Isso garante consistência entre execuções para o mesmo conteúdo
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  const hashArray = new Uint8Array(hash);
  
  // Converter hash em embedding de 1536 dimensões (padrão OpenAI)
  const embedding = new Array(1536);
  for (let i = 0; i < 1536; i++) {
    // Usar bytes do hash de forma cíclica e normalizar para [-1, 1]
    const byteIndex = i % hashArray.length;
    embedding[i] = (hashArray[byteIndex] / 255) * 2 - 1;
  }
  
  return embedding;
  
  /* 
  // IMPLEMENTAÇÃO FUTURA COM OPENAI (descomente quando configurar):
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada');
  }
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texto.substring(0, 8000) // Limitar texto
    })
  });

  if (!response.ok) {
    throw new Error(`Erro ao gerar embedding: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
  */
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Token de autorização necessário')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Usuário não autenticado')

    const { obra_id, tipo_conteudo, forcar_atualizacao = false } = await req.json()

    // Verificar permissões
    const { data: obra } = await supabase
      .from('obras')
      .select('id, usuario_id')
      .eq('id', obra_id)
      .single()

    if (!obra || obra.usuario_id !== user.id) {
      throw new Error('Acesso negado a esta obra')
    }

    let resultados = []

    // Vetorizar diferentes tipos de conteúdo
    switch (tipo_conteudo) {
      case 'obra':
        resultados = await vetorizarObra(supabase, obra_id)
        break
      case 'despesas':
        resultados = await vetorizarDespesas(supabase, obra_id)
        break
      case 'fornecedores':
        resultados = await vetorizarFornecedores(supabase, obra_id)
        break
      case 'todos': {
        // Vetorizar todos os tipos
        const todos = await Promise.all([
          vetorizarObra(supabase, obra_id),
          vetorizarDespesas(supabase, obra_id),
          vetorizarFornecedores(supabase, obra_id)
        ])
        resultados = todos.flat()
        break
      }
      default:
        throw new Error('Tipo de conteúdo inválido')
    }

    return new Response(JSON.stringify({ 
      sucesso: true,
      embeddings_gerados: resultados.length,
      tipos_processados: tipo_conteudo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erro ao gerar embeddings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Função para vetorizar dados da obra
async function vetorizarObra(supabase: SupabaseClient, obra_id: string) {
  const { data: obra } = await supabase
    .from('obras')
    .select('*')
    .eq('id', obra_id)
    .single()

  if (!obra) return []

  const conteudo = `
    Obra: ${obra.nome}
    Endereço: ${obra.endereco}, ${obra.cidade}/${obra.estado} - CEP: ${obra.cep}
    Orçamento: R$ ${obra.orcamento}
    Data de início: ${obra.data_inicio || 'Não definida'}
    Previsão de conclusão: ${obra.data_prevista_termino || 'Não definida'}
  `

  const embedding = await gerarEmbedding(conteudo)
  const tituloEmbedding = await gerarEmbedding(obra.nome)

  // Verificar se já existe
  const { data: existente } = await supabase
    .from('embeddings_conhecimento')
    .select('id')
    .eq('obra_id', obra_id)
    .eq('tipo_conteudo', 'obra')
    .eq('referencia_id', obra.id)
    .single()

  if (existente) {
    // Atualizar existente
    await supabase
      .from('embeddings_conhecimento')
      .update({
        titulo: `Dados da Obra: ${obra.nome}`,
        conteudo: conteudo,
        conteudo_resumido: `Obra ${obra.nome}, orçamento R$ ${obra.orcamento}`,
        embedding: `[${embedding.join(',')}]`,
        titulo_embedding: `[${tituloEmbedding.join(',')}]`,
        metadata: {
          orcamento: obra.orcamento,
          data_inicio: obra.data_inicio,
          cidade: obra.cidade,
          estado: obra.estado
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', existente.id)
  } else {
    // Inserir novo
    await supabase.from('embeddings_conhecimento').insert({
      obra_id: obra_id,
      tipo_conteudo: 'obra',
      referencia_id: obra.id,
      titulo: `Dados da Obra: ${obra.nome}`,
      conteudo: conteudo,
      conteudo_resumido: `Obra ${obra.nome}, orçamento R$ ${obra.orcamento}`,
      embedding: `[${embedding.join(',')}]`,
      titulo_embedding: `[${tituloEmbedding.join(',')}]`,
      metadata: {
        orcamento: obra.orcamento,
        data_inicio: obra.data_inicio,
        cidade: obra.cidade,
        estado: obra.estado
      }
    })
  }

  return [{ tipo: 'obra', id: obra.id }]
}

// Função para vetorizar despesas
async function vetorizarDespesas(supabase: SupabaseClient, obra_id: string) {
  const { data: despesas } = await supabase
    .from('despesas')
    .select(`
      *,
      fornecedores_pj (razao_social, nome_fantasia),
      fornecedores_pf (nome)
    `)
    .eq('obra_id', obra_id)
    .order('created_at', { ascending: false })
    .limit(50) // Limitar para não sobrecarregar

  if (!despesas?.length) return []

  const resultados = []

  // Agrupar despesas para criar embeddings mais úteis
  const despesasAgrupadas = {
    recentes: despesas.slice(0, 10),
    por_categoria: {}
  }

  // Agrupar por categoria
  despesas.forEach(d => {
    const cat = d.categoria || 'OUTROS'
    if (!despesasAgrupadas.por_categoria[cat]) {
      despesasAgrupadas.por_categoria[cat] = []
    }
    despesasAgrupadas.por_categoria[cat].push(d)
  })

  // Criar embedding para despesas recentes
  const despesasRecentesTexto = despesasAgrupadas.recentes.map(d => 
    `${d.descricao}: R$ ${d.custo} - ${d.data_despesa} - ${d.pago ? 'PAGO' : 'PENDENTE'}`
  ).join('\n')

  const conteudoRecentes = `
    Despesas Recentes da Obra:
    ${despesasRecentesTexto}
    Total: R$ ${despesasAgrupadas.recentes.reduce((sum, d) => sum + d.custo, 0)}
  `

  const embeddingRecentes = await gerarEmbedding(conteudoRecentes)
  
  await supabase.from('embeddings_conhecimento').insert({
    obra_id: obra_id,
    tipo_conteudo: 'despesas',
    referencia_id: obra_id, // Usar obra_id como referência para agrupamentos
    titulo: 'Despesas Recentes',
    conteudo: conteudoRecentes,
    conteudo_resumido: `${despesasAgrupadas.recentes.length} despesas recentes`,
    embedding: `[${embeddingRecentes.join(',')}]`,
    titulo_embedding: `[${embeddingRecentes.join(',')}]`,
    metadata: {
      tipo_agrupamento: 'recentes',
      quantidade: despesasAgrupadas.recentes.length,
      total: despesasAgrupadas.recentes.reduce((sum, d) => sum + d.custo, 0)
    }
  })

  resultados.push({ tipo: 'despesas', id: 'recentes' })

  // Criar embeddings por categoria
  for (const [categoria, despesasCat] of Object.entries(despesasAgrupadas.por_categoria)) {
    const despesasTexto = despesasCat.slice(0, 10).map(d => 
      `${d.descricao}: R$ ${d.custo}`
    ).join('\n')

    const conteudoCategoria = `
      Despesas de ${categoria}:
      ${despesasTexto}
      Total da categoria: R$ ${despesasCat.reduce((sum, d) => sum + d.custo, 0)}
      Quantidade: ${despesasCat.length} despesas
    `

    const embeddingCategoria = await gerarEmbedding(conteudoCategoria)
    
    await supabase.from('embeddings_conhecimento').insert({
      obra_id: obra_id,
      tipo_conteudo: 'despesas',
      referencia_id: obra_id,
      titulo: `Despesas - ${categoria}`,
      conteudo: conteudoCategoria,
      conteudo_resumido: `${despesasCat.length} despesas de ${categoria}`,
      embedding: `[${embeddingCategoria.join(',')}]`,
      titulo_embedding: `[${embeddingCategoria.join(',')}]`,
      metadata: {
        tipo_agrupamento: 'categoria',
        categoria: categoria,
        quantidade: despesasCat.length,
        total: despesasCat.reduce((sum, d) => sum + d.custo, 0)
      }
    })

    resultados.push({ tipo: 'despesas', id: `categoria_${categoria}` })
  }

  return resultados
}

// Função para vetorizar fornecedores
async function vetorizarFornecedores(supabase: SupabaseClient, obra_id: string) {
  // Buscar fornecedores vinculados à obra através de despesas
  const { data: despesas } = await supabase
    .from('despesas')
    .select(`
      fornecedor_pj_id,
      fornecedor_pf_id,
      fornecedores_pj!inner (
        id,
        razao_social,
        nome_fantasia,
        cnpj,
        telefone_principal,
        email
      ),
      fornecedores_pf!inner (
        id,
        nome,
        cpf,
        telefone_principal,
        email
      )
    `)
    .eq('obra_id', obra_id)

  if (!despesas?.length) return []

  const fornecedoresPJ = new Map()
  const fornecedoresPF = new Map()

  // Coletar fornecedores únicos
  despesas.forEach(d => {
    if (d.fornecedor_pj_id && d.fornecedores_pj) {
      fornecedoresPJ.set(d.fornecedor_pj_id, d.fornecedores_pj)
    }
    if (d.fornecedor_pf_id && d.fornecedores_pf) {
      fornecedoresPF.set(d.fornecedor_pf_id, d.fornecedores_pf)
    }
  })

  const resultados = []

  // Vetorizar fornecedores PJ
  for (const [id, fornecedor] of fornecedoresPJ) {
    const conteudo = `
      Fornecedor PJ: ${fornecedor.nome_fantasia || fornecedor.razao_social}
      CNPJ: ${fornecedor.cnpj}
      Telefone: ${fornecedor.telefone_principal || 'Não informado'}
      Email: ${fornecedor.email || 'Não informado'}
    `

    const embedding = await gerarEmbedding(conteudo)
    
    await supabase.from('embeddings_conhecimento').insert({
      obra_id: obra_id,
      tipo_conteudo: 'fornecedor',
      referencia_id: fornecedor.id,
      titulo: `Fornecedor: ${fornecedor.nome_fantasia || fornecedor.razao_social}`,
      conteudo: conteudo,
      conteudo_resumido: `${fornecedor.nome_fantasia || fornecedor.razao_social} - CNPJ: ${fornecedor.cnpj}`,
      embedding: `[${embedding.join(',')}]`,
      titulo_embedding: `[${embedding.join(',')}]`,
      metadata: {
        tipo_fornecedor: 'PJ',
        cnpj: fornecedor.cnpj
      }
    })

    resultados.push({ tipo: 'fornecedor_pj', id: fornecedor.id })
  }

  // Vetorizar fornecedores PF
  for (const [id, fornecedor] of fornecedoresPF) {
    const conteudo = `
      Fornecedor PF: ${fornecedor.nome}
      CPF: ${fornecedor.cpf}
      Telefone: ${fornecedor.telefone_principal || 'Não informado'}
      Email: ${fornecedor.email || 'Não informado'}
    `

    const embedding = await gerarEmbedding(conteudo)
    
    await supabase.from('embeddings_conhecimento').insert({
      obra_id: obra_id,
      tipo_conteudo: 'fornecedor',
      referencia_id: fornecedor.id,
      titulo: `Fornecedor: ${fornecedor.nome}`,
      conteudo: conteudo,
      conteudo_resumido: `${fornecedor.nome} - CPF: ${fornecedor.cpf}`,
      embedding: `[${embedding.join(',')}]`,
      titulo_embedding: `[${embedding.join(',')}]`,
      metadata: {
        tipo_fornecedor: 'PF',
        cpf: fornecedor.cpf
      }
    })

    resultados.push({ tipo: 'fornecedor_pf', id: fornecedor.id })
  }

  return resultados
} 