// 🤖 Serviço de IA para Insights de Métricas
import { supabase } from '@/integrations/supabase/client'

export interface MetricsData {
  leads: {
    total: number
    converted: number
    pending: number
    trend: number
  }
  users: {
    total: number
    active: number
    churn: number
    trend: number
  }
  revenue: {
    mrr: number
    arr: number
    ltv: number
    cac: number
    trend: number
  }
  product: {
    aiUsage: number
    orcamentos: number
    avgSessionTime: number
    trend: number
  }
}

export interface AIInsight {
  type: 'success' | 'warning' | 'danger' | 'info'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  recommendation: string
}

export const aiInsights = {
  // 📊 Analisar métricas e gerar insights
  async analyzeMetrics(metrics: MetricsData): Promise<AIInsight[]> {
    const insights: AIInsight[] = []

    // ✅ Validação de dados
    if (!metrics || !metrics.leads || !metrics.users || !metrics.revenue || !metrics.product) {
      console.warn('Métricas incompletas recebidas:', metrics)
      return [{
        type: 'info',
        priority: 'low',
        title: 'Dados Insuficientes',
        message: 'Aguardando dados completos para análise',
        recommendation: 'Verifique se todas as métricas estão sendo coletadas corretamente'
      }]
    }

    // 🎯 Análise de Conversão de Leads
    const conversionRate = metrics.leads.total > 0 ? (metrics.leads.converted / metrics.leads.total) * 100 : 0
    if (conversionRate < 2) {
      insights.push({
        type: 'danger',
        priority: 'high',
        title: 'Taxa de Conversão Baixa',
        message: `Apenas ${conversionRate.toFixed(1)}% dos leads estão convertendo`,
        recommendation: 'Revise o processo de qualificação de leads e otimize o funil de vendas'
      })
    } else if (conversionRate < 5) {
      insights.push({
        type: 'warning',
        priority: 'medium',
        title: 'Conversão Pode Melhorar',
        message: `Taxa de conversão de ${conversionRate.toFixed(1)}% está na média`,
        recommendation: 'Teste diferentes abordagens de follow-up e qualificação'
      })
    } else {
      insights.push({
        type: 'success',
        priority: 'low',
        title: 'Boa Conversão de Leads',
        message: `Excelente taxa de ${conversionRate.toFixed(1)}%`,
        recommendation: 'Continue monitorando e documente as melhores práticas'
      })
    }

    // 📉 Análise de Churn
    if (metrics.users.churn > 10) {
      insights.push({
        type: 'danger',
        priority: 'high',
        title: 'Churn Crítico',
        message: `${metrics.users.churn}% dos usuários cancelaram`,
        recommendation: 'Implemente programa de retenção urgente e pesquise motivos de cancelamento'
      })
    } else if (metrics.users.churn > 5) {
      insights.push({
        type: 'warning',
        priority: 'medium',
        title: 'Churn Elevado',
        message: `Churn de ${metrics.users.churn}% precisa de atenção`,
        recommendation: 'Melhore onboarding e suporte ao cliente'
      })
    }

    // 💰 Análise LTV/CAC
    const ltvCacRatio = metrics.revenue.cac > 0 ? metrics.revenue.ltv / metrics.revenue.cac : 0
    if (ltvCacRatio < 3) {
      insights.push({
        type: 'warning',
        priority: 'high',
        title: 'LTV/CAC Baixo',
        message: `Relação de ${ltvCacRatio.toFixed(1)}x está abaixo do ideal`,
        recommendation: 'Otimize custos de aquisição ou aumente valor do cliente'
      })
    } else if (ltvCacRatio > 5) {
      insights.push({
        type: 'success',
        priority: 'medium',
        title: 'Excelente LTV/CAC',
        message: `Relação de ${ltvCacRatio.toFixed(1)}x é muito boa`,
        recommendation: 'Considere aumentar investimento em marketing'
      })
    }

    // 🚀 Análise de Uso do Produto
    if (metrics.product.aiUsage < 100) {
      insights.push({
        type: 'info',
        priority: 'medium',
        title: 'Baixo Uso da IA',
        message: `Apenas ${metrics.product.aiUsage} consultas à IA`,
        recommendation: 'Promova mais as funcionalidades de IA para aumentar engajamento'
      })
    }

    // 📈 Análise de Tendências
    if (metrics.revenue.trend < -10) {
      insights.push({
        type: 'danger',
        priority: 'high',
        title: 'Receita em Queda',
        message: `Receita caiu ${Math.abs(metrics.revenue.trend)}% no período`,
        recommendation: 'Analise causas da queda e implemente ações corretivas imediatas'
      })
    }

    return insights
  },

  // 💬 Chat interativo com métricas via Edge Function
  async chatWithMetrics(userMessage: string, metrics: MetricsData): Promise<string> {
    try {
      // ✅ Validação de dados antes de enviar para a Edge Function
      if (!metrics || !metrics.leads || !metrics.users || !metrics.revenue || !metrics.product) {
        return this.generateSmartFallbackResponse(userMessage, metrics)
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          metrics: {
            leads: {
              total: metrics.leads?.total || 0,
              converted: metrics.leads?.converted || 0
            },
            users: {
              total: metrics.users?.total || 0,
              active: metrics.users?.active || 0,
              churn: metrics.users?.churn || 0
            },
            revenue: {
              mrr: metrics.revenue?.mrr || 0,
              arr: metrics.revenue?.arr || 0,
              ltv: metrics.revenue?.ltv || 0,
              cac: metrics.revenue?.cac || 0
            },
            product: {
              aiUsage: metrics.product?.aiUsage || 0,
              orcamentos: metrics.product?.orcamentos || 0
            }
          }
        }
      })

      if (error) {
        console.error('Erro na Edge Function:', error)
        return this.generateSmartFallbackResponse(userMessage, metrics)
      }

      return data.response || 'Não consegui gerar uma resposta adequada.'

    } catch (error) {
      console.error('Erro no chat:', error)
      return this.generateSmartFallbackResponse(userMessage, metrics)
    }
  },

  // 🤖 Resposta inteligente de fallback
  generateSmartFallbackResponse(userMessage: string, metrics: MetricsData | null): string {
    const message = userMessage.toLowerCase()
    
    // ✅ Verificar se métricas estão disponíveis
    if (!metrics || !metrics.leads || !metrics.users || !metrics.revenue || !metrics.product) {
      return 'Desculpe, não tenho dados suficientes para responder sua pergunta no momento. Aguarde o carregamento das métricas ou tente novamente.'
    }
    
    // Análise de conversão
    if (message.includes('conversão') || message.includes('convert')) {
      const conversionRate = metrics.leads.total > 0 
        ? ((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)
        : '0.0'
      return `Sua taxa de conversão atual é de ${conversionRate}%. ${
        parseFloat(conversionRate) < 3 
          ? 'Considere otimizar o funil de vendas e qualificar melhor os leads.' 
          : 'Boa performance! Continue monitorando e testando melhorias.'
      }`
    }

    // Análise de churn
    if (message.includes('churn') || message.includes('cancelamento')) {
      return `Seu churn rate está em ${metrics.users.churn}%. ${
        metrics.users.churn > 5 
          ? 'Foque em melhorar a experiência do usuário e suporte ao cliente.' 
          : 'Churn controlado. Mantenha o foco na satisfação dos clientes.'
      }`
    }

    // Análise LTV/CAC
    if (message.includes('ltv') || message.includes('cac') || message.includes('retorno')) {
      const ratio = (metrics.revenue.ltv / metrics.revenue.cac).toFixed(1)
      return `Sua relação LTV/CAC é de ${ratio}x. ${
        parseFloat(ratio) < 3 
          ? 'Otimize os custos de aquisição ou aumente o valor do cliente.' 
          : 'Excelente! Seus investimentos em marketing estão gerando bom retorno.'
      }`
    }

    // Análise de receita
    if (message.includes('receita') || message.includes('mrr') || message.includes('arr')) {
      return `Sua receita mensal recorrente é R$ ${metrics.revenue.mrr.toLocaleString()}, projetando R$ ${metrics.revenue.arr.toLocaleString()} anuais. Foque em aumentar o ticket médio e reduzir o churn para acelerar o crescimento.`
    }

    // Análise de produto
    if (message.includes('ia') || message.includes('produto') || message.includes('uso')) {
      return `Seus usuários fizeram ${metrics.product.aiUsage} consultas à IA e geraram ${metrics.product.orcamentos} orçamentos. ${
        metrics.product.aiUsage > 1000 
          ? 'Alto engajamento com a IA! Considere expandir essas funcionalidades.' 
          : 'Promova mais o uso da IA para aumentar o valor percebido.'
      }`
    }

    // Resposta genérica
    return `Com base nas suas métricas atuais: ${metrics.leads.total} leads, ${((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)}% de conversão, ${metrics.users.churn}% de churn e LTV/CAC de ${(metrics.revenue.ltv / metrics.revenue.cac).toFixed(1)}x. Posso ajudar com análises específicas sobre conversão, churn, receita ou uso do produto.`
  }
} 