// Analytics API para ObrasAI - Sistema de Métricas e KPIs
import { supabase } from '@/integrations/supabase/client'

// Tipos para Analytics
export interface AnalyticsEvent {
  event_type: string
  user_id?: string
  session_id?: string
  page?: string
  properties?: Record<string, any>
  timestamp?: string
}

export interface LeadMetrics {
  total_leads: number
  conversion_rate: number
  leads_today: number
  leads_this_week: number
  leads_this_month: number
  top_sources: Array<{source: string, count: number}>
}

export interface UserMetrics {
  total_users: number
  active_users_today: number
  active_users_week: number
  active_users_month: number
  new_registrations_today: number
  churn_rate: number
}

export interface ProductMetrics {
  ai_chat_usage: number
  orcamentos_generated: number
  sinapi_searches: number
  notes_uploaded: number
  obras_created: number
  total_api_calls: number
}

export interface BusinessMetrics {
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  cac: number // Customer Acquisition Cost
  ltv: number // Customer Lifetime Value
  subscription_breakdown: Record<string, number>
}

class AnalyticsService {
  
  // 📊 TRACKING DE EVENTOS
  async trackEvent(event: AnalyticsEvent) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert([{
          event_type: event.event_type,
          user_id: event.user_id,
          session_id: event.session_id || this.getSessionId(),
          page: event.page,
          properties: event.properties,
          timestamp: event.timestamp || new Date().toISOString()
        }])

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  // 🎯 TRACKING DE LEADS
  async trackLead(leadData: {
    email: string
    source: string
    campaign?: string
    referrer?: string
  }) {
    await this.trackEvent({
      event_type: 'lead_captured',
      properties: {
        email: leadData.email,
        source: leadData.source,
        campaign: leadData.campaign,
        referrer: leadData.referrer,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 👤 TRACKING DE USUÁRIOS
  async trackUserAction(action: string, properties?: Record<string, any>) {
    const user = await supabase.auth.getUser()
    
    await this.trackEvent({
      event_type: `user_${action}`,
      user_id: user.data.user?.id,
      properties: {
        ...properties,
        user_email: user.data.user?.email
      }
    })
  }

  // 🤖 TRACKING DE IA
  async trackAIUsage(type: 'chat' | 'orcamento' | 'sinapi', properties?: Record<string, any>) {
    const user = await supabase.auth.getUser()
    
    await this.trackEvent({
      event_type: `ai_${type}_used`,
      user_id: user.data.user?.id,
      properties: {
        ...properties,
        ai_type: type,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 💰 TRACKING DE CONVERSÕES
  async trackConversion(type: 'signup' | 'subscription' | 'upgrade', properties?: Record<string, any>) {
    const user = await supabase.auth.getUser()
    
    await this.trackEvent({
      event_type: `conversion_${type}`,
      user_id: user.data.user?.id,
      properties: {
        ...properties,
        conversion_type: type,
        value: properties?.value || 0
      }
    })
  }

  // 📈 MÉTRICAS DE LEADS
  async getLeadMetrics(): Promise<LeadMetrics> {
    try {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')

      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'lead_captured')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const total_leads = leadsData?.length || 0
      const leads_today = this.countRecordsToday(leadsData || [])
      const leads_this_week = this.countRecordsThisWeek(leadsData || [])
      const leads_this_month = this.countRecordsThisMonth(leadsData || [])
      
      // Taxa de conversão (leads que viraram usuários)
      const { data: usersData } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'conversion_signup')

      const conversion_rate = total_leads > 0 ? (usersData?.length || 0) / total_leads * 100 : 0

      // Top sources
      const sources = (leadsData || []).reduce((acc: Record<string, number>, lead: any) => {
        const source = lead.origem || 'unknown'
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      const top_sources = Object.entries(sources)
        .map(([source, count]) => ({ source, count: count as number }))
        .sort((a, b) => b.count - a.count)

      return {
        total_leads,
        conversion_rate,
        leads_today,
        leads_this_week,
        leads_this_month,
        top_sources
      }
    } catch (error) {
      console.error('Error getting lead metrics:', error)
      return {
        total_leads: 0,
        conversion_rate: 0,
        leads_today: 0,
        leads_this_week: 0,
        leads_this_month: 0,
        top_sources: []
      }
    }
  }

  // 👥 MÉTRICAS DE USUÁRIOS
  async getUserMetrics(): Promise<UserMetrics> {
    try {
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')

      const { data: activeToday } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      const { data: activeWeek } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const { data: activeMonth } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const { data: newToday } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'conversion_signup')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      const total_users = allUsers?.length || 0
      const active_users_today = new Set(activeToday?.map(e => e.user_id)).size
      const active_users_week = new Set(activeWeek?.map(e => e.user_id)).size
      const active_users_month = new Set(activeMonth?.map(e => e.user_id)).size
      const new_registrations_today = newToday?.length || 0

      // Churn rate (usuários que não usaram nos últimos 30 dias)
      const churn_rate = total_users > 0 ? ((total_users - active_users_month) / total_users) * 100 : 0

      return {
        total_users,
        active_users_today,
        active_users_week,
        active_users_month,
        new_registrations_today,
        churn_rate: Math.round(churn_rate * 100) / 100
      }
    } catch (error) {
      console.error('Error getting user metrics:', error)
      return {
        total_users: 0,
        active_users_today: 0,
        active_users_week: 0,
        active_users_month: 0,
        new_registrations_today: 0,
        churn_rate: 0
      }
    }
  }

  // 🎯 MÉTRICAS DE PRODUTO
  async getProductMetrics(): Promise<ProductMetrics> {
    try {
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const { data: aiChats } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'ai_chat_used')
        .gte('timestamp', last30Days)

      const { data: orcamentos } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'ai_orcamento_used')
        .gte('timestamp', last30Days)

      const { data: sinapiSearches } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'ai_sinapi_used')
        .gte('timestamp', last30Days)

      const { data: notes } = await supabase
        .from('notas_fiscais')
        .select('*')
        .gte('created_at', last30Days)

      const { data: obras } = await supabase
        .from('obras')
        .select('*')
        .gte('created_at', last30Days)

      const { data: allEvents } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', last30Days)

      return {
        ai_chat_usage: aiChats?.length || 0,
        orcamentos_generated: orcamentos?.length || 0,
        sinapi_searches: sinapiSearches?.length || 0,
        notes_uploaded: notes?.length || 0,
        obras_created: obras?.length || 0,
        total_api_calls: allEvents?.length || 0
      }
    } catch (error) {
      console.error('Error getting product metrics:', error)
      return {
        ai_chat_usage: 0,
        orcamentos_generated: 0,
        sinapi_searches: 0,
        notes_uploaded: 0,
        obras_created: 0,
        total_api_calls: 0
      }
    }
  }

  // 💰 MÉTRICAS DE NEGÓCIO
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active')

      const planPrices = {
        'basic': 97,
        'professional': 197,
        'enterprise': 497
      }

      const subscription_breakdown = subscriptions?.reduce((acc: Record<string, number>, sub: any) => {
        const plan = sub.plan_name || 'basic'
        acc[plan] = (acc[plan] || 0) + 1
        return acc
      }, {}) || {}

      const mrr = subscriptions?.reduce((total: number, sub: any) => {
        const plan = sub.plan_name || 'basic'
        return total + (planPrices[plan as keyof typeof planPrices] || 0)
      }, 0) || 0

      const arr = mrr * 12

      // CAC e LTV simplificados (podem ser refinados com mais dados)
      const cac = 200 // Estimativa baseada no marketing spend
      const ltv = mrr > 0 ? (mrr / (subscriptions?.length || 1)) * 24 : 0 // 24 meses de vida média

      return {
        mrr,
        arr,
        cac,
        ltv: Math.round(ltv),
        subscription_breakdown
      }
    } catch (error) {
      console.error('Error getting business metrics:', error)
      return {
        mrr: 0,
        arr: 0,
        cac: 0,
        ltv: 0,
        subscription_breakdown: {}
      }
    }
  }

  // 🛠️ MÉTODOS AUXILIARES
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('obrasai_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('obrasai_session_id', sessionId)
    }
    return sessionId
  }

  private countRecordsToday(records: any[]): number {
    const today = new Date().toDateString()
    return records.filter(record => 
      new Date(record.created_at).toDateString() === today
    ).length
  }

  private countRecordsThisWeek(records: any[]): number {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return records.filter(record => 
      new Date(record.created_at) >= weekAgo
    ).length
  }

  private countRecordsThisMonth(records: any[]): number {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return records.filter(record => 
      new Date(record.created_at) >= monthAgo
    ).length
  }

  // 📊 MÉTODO PRINCIPAL PARA DASHBOARD
  async getAllMetrics() {
    const [leadMetrics, userMetrics, productMetrics, businessMetrics] = await Promise.all([
      this.getLeadMetrics(),
      this.getUserMetrics(),
      this.getProductMetrics(),
      this.getBusinessMetrics()
    ])

    return {
      leads: leadMetrics,
      users: userMetrics,
      product: productMetrics,
      business: businessMetrics,
      lastUpdated: new Date().toISOString()
    }
  }
}

export const analytics = new AnalyticsService()

// Hooks para facilitar o uso nos componentes
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackLead: analytics.trackLead.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackAIUsage: analytics.trackAIUsage.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics)
  }
} 