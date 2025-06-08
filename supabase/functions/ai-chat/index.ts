import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface ChatRequest {
  message: string
  metrics: {
    leads: { total: number; converted: number }
    users: { total: number; active: number; churn: number }
    revenue: { mrr: number; arr: number; ltv: number; cac: number }
    product: { aiUsage: number; orcamentos: number }
  }
}

interface ChatResponse {
  response: string
  error?: string
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse do body
    const { message, metrics }: ChatRequest = await req.json()

    if (!message || !metrics) {
      return new Response(
        JSON.stringify({ error: 'Mensagem e métricas são obrigatórias' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Obter API key do ambiente
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    console.log('🔑 OpenAI API Key disponível:', openaiApiKey ? 'SIM' : 'NÃO')

    if (!openaiApiKey) {
      console.log('⚠️ OpenAI API Key não encontrada, usando fallback')
      // Fallback inteligente
      const fallbackResponse = generateSmartFallback(message, metrics)
      
      return new Response(
        JSON.stringify({ response: `[FALLBACK] ${fallbackResponse}` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prompt especializado para ObrasAI
    const prompt = `
Você é um consultor especialista em métricas de negócio para o ObrasAI, uma plataforma de gestão de obras.

CONTEXTO DAS MÉTRICAS ATUAIS:
- Leads: ${metrics.leads.total} total, ${metrics.leads.converted} convertidos (${((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)}%)
- Usuários: ${metrics.users.total} total, ${metrics.users.active} ativos, ${metrics.users.churn}% churn
- Receita: R$ ${metrics.revenue.mrr.toLocaleString()} MRR, R$ ${metrics.revenue.arr.toLocaleString()} ARR
- LTV/CAC: R$ ${metrics.revenue.ltv.toLocaleString()} / R$ ${metrics.revenue.cac.toLocaleString()} = ${(metrics.revenue.ltv / metrics.revenue.cac).toFixed(1)}x
- Produto: ${metrics.product.aiUsage} usos de IA, ${metrics.product.orcamentos} orçamentos gerados

PERGUNTA DO USUÁRIO: "${message}"

Responda de forma:
- Direta e prática (máximo 150 palavras)
- Com insights específicos baseados nos números
- Sugerindo ações concretas quando relevante
- Tom consultivo e profissional
- Focado no contexto de gestão de obras

Não mencione que você é uma IA ou que tem limitações.
`

    // Chamada para OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ Erro OpenAI:', errorText)
      
      // Fallback em caso de erro
      const fallbackResponse = generateSmartFallback(message, metrics)
      
      return new Response(
        JSON.stringify({ response: `[ERRO API] ${fallbackResponse}` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0]?.message?.content || 'Não consegui gerar uma resposta adequada.'

    console.log('✅ Resposta OpenAI recebida com sucesso')

    return new Response(
      JSON.stringify({ response: `[OPENAI] ${aiResponse}` }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// 🤖 Função de fallback inteligente
function generateSmartFallback(message: string, metrics: any): string {
  const msg = message.toLowerCase()
  
  // Análise de conversão
  if (msg.includes('conversão') || msg.includes('convert')) {
    const conversionRate = ((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)
    return `Sua taxa de conversão atual é de ${conversionRate}%. ${
      parseFloat(conversionRate) < 3 
        ? 'Considere otimizar o funil de vendas e qualificar melhor os leads.' 
        : 'Boa performance! Continue monitorando e testando melhorias.'
    }`
  }

  // Análise de churn
  if (msg.includes('churn') || msg.includes('cancelamento')) {
    return `Seu churn rate está em ${metrics.users.churn}%. ${
      metrics.users.churn > 5 
        ? 'Foque em melhorar a experiência do usuário e suporte ao cliente.' 
        : 'Churn controlado. Mantenha o foco na satisfação dos clientes.'
    }`
  }

  // Análise LTV/CAC
  if (msg.includes('ltv') || msg.includes('cac') || msg.includes('retorno')) {
    const ratio = (metrics.revenue.ltv / metrics.revenue.cac).toFixed(1)
    return `Sua relação LTV/CAC é de ${ratio}x. ${
      parseFloat(ratio) < 3 
        ? 'Otimize os custos de aquisição ou aumente o valor do cliente.' 
        : 'Excelente! Seus investimentos em marketing estão gerando bom retorno.'
    }`
  }

  // Análise de receita
  if (msg.includes('receita') || msg.includes('mrr') || msg.includes('arr')) {
    return `Sua receita mensal recorrente é R$ ${metrics.revenue.mrr.toLocaleString()}, projetando R$ ${metrics.revenue.arr.toLocaleString()} anuais. Foque em aumentar o ticket médio e reduzir o churn para acelerar o crescimento.`
  }

  // Análise de produto
  if (msg.includes('ia') || msg.includes('produto') || msg.includes('uso')) {
    return `Seus usuários fizeram ${metrics.product.aiUsage} consultas à IA e geraram ${metrics.product.orcamentos} orçamentos. ${
      metrics.product.aiUsage > 1000 
        ? 'Alto engajamento com a IA! Considere expandir essas funcionalidades.' 
        : 'Promova mais o uso da IA para aumentar o valor percebido.'
    }`
  }

  // Resposta genérica
  return `Com base nas suas métricas atuais: ${metrics.leads.total} leads, ${((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)}% de conversão, ${metrics.users.churn}% de churn e LTV/CAC de ${(metrics.revenue.ltv / metrics.revenue.cac).toFixed(1)}x. Posso ajudar com análises específicas sobre conversão, churn, receita ou uso do produto.`
} 