// 📊 Dashboard Executivo de Métricas - ObrasAI 2.2
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Bot, 
  FileText, 
  Building, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  Eye,
  Download,
  LogOut,
  Shield
} from 'lucide-react'
import type { 
  LeadMetrics, 
  UserMetrics, 
  ProductMetrics, 
  BusinessMetrics 
} from '@/services/analyticsApi'
import { AIInsightsWidget } from '@/components/admin/AIInsightsWidget'
import type { MetricsData } from '@/services/aiInsightsApi'

interface AllMetrics {
  leads: LeadMetrics
  users: UserMetrics
  product: ProductMetrics
  business: BusinessMetrics
  lastUpdated: string
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<AllMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [aiWidgetVisible, setAiWidgetVisible] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // 🔐 Verificação de acesso administrativo (temporária - implementar role-based depois)
  useEffect(() => {
    // TODO: Implementar verificação de role de admin
    // Por enquanto, qualquer usuário logado pode acessar para testes
    if (!user) {
      navigate('/login')
      return
    }
  }, [user, navigate])

  // 📊 Carregar métricas
  const loadMetrics = async () => {
    try {
      setRefreshing(true)
      
      // 🚧 DADOS MOCK TEMPORÁRIOS - Substituir por analytics.getAllMetrics() quando tabelas estiverem prontas
      const mockData = {
        leads: {
          total_leads: 127,
          conversion_rate: 12.5,
          leads_today: 8,
          leads_this_week: 34,
          leads_this_month: 89,
          top_sources: [
            { source: 'Google Ads', count: 45 },
            { source: 'Facebook', count: 32 },
            { source: 'LinkedIn', count: 28 },
            { source: 'Orgânico', count: 22 }
          ]
        },
        users: {
          total_users: 89,
          active_users_today: 23,
          active_users_week: 67,
          active_users_month: 84,
          new_registrations_today: 3,
          churn_rate: 5.2
        },
        product: {
          ai_chat_usage: 156,
          orcamentos_generated: 43,
          sinapi_searches: 89,
          notes_uploaded: 67,
          obras_created: 34,
          total_api_calls: 1247
        },
        business: {
          mrr: 18500,
          arr: 222000,
          cac: 185,
          ltv: 2400,
          subscription_breakdown: {
            basic: 45,
            professional: 32,
            enterprise: 12
          }
        },
        lastUpdated: new Date().toISOString()
      }
      
      setMetrics(mockData)
      
      // TODO: Descomentar quando tabelas estiverem prontas
      // const data = await analytics.getAllMetrics()
      // setMetrics(data)
      
    } catch (error) {
      console.error('Error loading metrics:', error)
      
      // Fallback para dados mock em caso de erro
      setMetrics({
        leads: { total_leads: 0, conversion_rate: 0, leads_today: 0, leads_this_week: 0, leads_this_month: 0, top_sources: [] },
        users: { total_users: 0, active_users_today: 0, active_users_week: 0, active_users_month: 0, new_registrations_today: 0, churn_rate: 0 },
        product: { ai_chat_usage: 0, orcamentos_generated: 0, sinapi_searches: 0, notes_uploaded: 0, obras_created: 0, total_api_calls: 0 },
        business: { mrr: 0, arr: 0, cac: 0, ltv: 0, subscription_breakdown: {} },
        lastUpdated: new Date().toISOString()
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMetrics()
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(loadMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // 🔄 Converter métricas para formato do AI Insights
  const convertMetricsForAI = (allMetrics: AllMetrics): MetricsData => {
    return {
      leads: {
        total: allMetrics.leads.total_leads,
        converted: Math.round(allMetrics.leads.total_leads * (allMetrics.leads.conversion_rate / 100)),
        pending: allMetrics.leads.total_leads - Math.round(allMetrics.leads.total_leads * (allMetrics.leads.conversion_rate / 100)),
        trend: 0 // Calcular trend baseado em dados históricos quando disponível
      },
      users: {
        total: allMetrics.users.total_users,
        active: allMetrics.users.active_users_month,
        churn: allMetrics.users.churn_rate,
        trend: 0 // Calcular trend baseado em dados históricos quando disponível
      },
      revenue: {
        mrr: allMetrics.business.mrr,
        arr: allMetrics.business.arr,
        ltv: allMetrics.business.ltv,
        cac: allMetrics.business.cac,
        trend: 0 // Calcular trend baseado em dados históricos quando disponível
      },
      product: {
        aiUsage: allMetrics.product.ai_chat_usage,
        orcamentos: allMetrics.product.orcamentos_generated,
        avgSessionTime: 0, // Implementar quando dados estiverem disponíveis
        trend: 0 // Calcular trend baseado em dados históricos quando disponível
      }
    }
  }

  // 🛠️ Componente de Métrica
  const MetricCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendValue,
    color = "default"
  }: {
    title: string
    value: string | number
    description: string
    icon: React.ElementType
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'default' | 'green' | 'red' | 'blue' | 'purple'
  }) => {
    const colorClasses = {
      default: 'text-gray-600',
      green: 'text-green-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600'
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <Activity className="h-3 w-3 text-gray-500 mr-1" />
              )}
              <span className={`text-xs ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando métricas...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p>Erro ao carregar métricas</p>
          <Button onClick={loadMetrics} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 🔐 Header Administrativo */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-xl font-bold">ObrasAI Admin</span>
            </div>
            <Badge variant="destructive" className="text-xs">
              ACESSO RESTRITO
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button
              onClick={() => logout()}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 🎯 Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📊 Dashboard Executivo</h1>
            <p className="text-muted-foreground">
              Métricas em tempo real do ObrasAI 2.2 - Visão do Negócio
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Atualizado: {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </Badge>
            <Button
              onClick={loadMetrics}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📈 Visão Geral</TabsTrigger>
          <TabsTrigger value="leads">🎯 Leads</TabsTrigger>
          <TabsTrigger value="users">👥 Usuários</TabsTrigger>
          <TabsTrigger value="product">🤖 Produto</TabsTrigger>
          <TabsTrigger value="business">💰 Financeiro</TabsTrigger>
        </TabsList>

        {/* 📈 VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Leads"
              value={metrics.leads.total_leads}
              description="Leads capturados"
              icon={Target}
              color="blue"
              trend="up"
              trendValue={`${metrics.leads.leads_this_week} esta semana`}
            />
            <MetricCard
              title="Usuários Ativos"
              value={metrics.users.total_users}
              description="Usuários registrados"
              icon={Users}
              color="green"
              trend="up"
              trendValue={`${metrics.users.active_users_today} hoje`}
            />
            <MetricCard
              title="MRR"
              value={`R$ ${metrics.business.mrr.toLocaleString()}`}
              description="Receita mensal recorrente"
              icon={DollarSign}
              color="purple"
              trend="up"
              trendValue={`ARR: R$ ${metrics.business.arr.toLocaleString()}`}
            />
            <MetricCard
              title="Taxa de Conversão"
              value={`${metrics.leads.conversion_rate.toFixed(1)}%`}
              description="Leads → Usuários"
              icon={TrendingUp}
              color={metrics.leads.conversion_rate > 15 ? "green" : "red"}
              trend={metrics.leads.conversion_rate > 15 ? "up" : "down"}
              trendValue={metrics.leads.conversion_rate > 15 ? "Meta atingida" : "Abaixo da meta"}
            />
          </div>

          {/* 🎯 KPIs Principais */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 KPIs Principais</CardTitle>
              <CardDescription>Indicadores críticos de performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Taxa de Conversão</span>
                    <span className="text-sm">{metrics.leads.conversion_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.leads.conversion_rate} className="h-2" />
                  <p className="text-xs text-muted-foreground">Meta: 15%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <span className="text-sm">{metrics.users.churn_rate}%</span>
                  </div>
                  <Progress value={metrics.users.churn_rate} className="h-2" />
                  <p className="text-xs text-muted-foreground">Meta: &lt;5%</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">LTV/CAC Ratio</span>
                    <span className="text-sm">{(metrics.business.ltv / metrics.business.cac).toFixed(1)}x</span>
                  </div>
                  <Progress value={Math.min((metrics.business.ltv / metrics.business.cac) * 10, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">Meta: &gt;3x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🎯 LEADS */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Leads Hoje"
              value={metrics.leads.leads_today}
              description="Capturados hoje"
              icon={Target}
              color="blue"
            />
            <MetricCard
              title="Leads esta Semana"
              value={metrics.leads.leads_this_week}
              description="Últimos 7 dias"
              icon={Calendar}
              color="green"
            />
            <MetricCard
              title="Leads este Mês"
              value={metrics.leads.leads_this_month}
              description="Últimos 30 dias"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🔥 Top Fontes de Leads</CardTitle>
              <CardDescription>Principais canais de aquisição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.leads.top_sources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{source.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {((source.count / metrics.leads.total_leads) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 👥 USUÁRIOS */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Usuários Hoje"
              value={metrics.users.active_users_today}
              description="Ativos hoje"
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Usuários Semana"
              value={metrics.users.active_users_week}
              description="Ativos esta semana"
              icon={Activity}
              color="green"
            />
            <MetricCard
              title="Usuários Mês"
              value={metrics.users.active_users_month}
              description="Ativos este mês"
              icon={TrendingUp}
              color="purple"
            />
            <MetricCard
              title="Novos Hoje"
              value={metrics.users.new_registrations_today}
              description="Registros hoje"
              icon={Eye}
              color="blue"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>📊 Análise de Engajamento</CardTitle>
              <CardDescription>Métricas de atividade dos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Retenção</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Taxa de Churn</span>
                      <span className="text-sm font-medium">{metrics.users.churn_rate}%</span>
                    </div>
                    <Progress value={metrics.users.churn_rate} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Crescimento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Novos vs Total</span>
                      <span className="text-sm font-medium">
                        {((metrics.users.new_registrations_today / metrics.users.total_users) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(metrics.users.new_registrations_today / metrics.users.total_users) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🤖 PRODUTO */}
        <TabsContent value="product" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <MetricCard
              title="Chat IA"
              value={metrics.product.ai_chat_usage}
              description="Conversas IA"
              icon={Bot}
              color="blue"
            />
            <MetricCard
              title="Orçamentos"
              value={metrics.product.orcamentos_generated}
              description="Gerados"
              icon={FileText}
              color="green"
            />
            <MetricCard
              title="SINAPI"
              value={metrics.product.sinapi_searches}
              description="Buscas"
              icon={Target}
              color="purple"
            />
            <MetricCard
              title="Notas Fiscais"
              value={metrics.product.notes_uploaded}
              description="Uploads"
              icon={Download}
              color="blue"
            />
            <MetricCard
              title="Obras"
              value={metrics.product.obras_created}
              description="Criadas"
              icon={Building}
              color="green"
            />
            <MetricCard
              title="API Calls"
              value={metrics.product.total_api_calls}
              description="Total"
              icon={Activity}
              color="purple"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Adoção de Funcionalidades</CardTitle>
              <CardDescription>Uso das principais features do produto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">IA Chat</span>
                    <span className="text-sm">{metrics.product.ai_chat_usage} usos</span>
                  </div>
                  <Progress value={Math.min((metrics.product.ai_chat_usage / 100) * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Orçamentos IA</span>
                    <span className="text-sm">{metrics.product.orcamentos_generated} gerados</span>
                  </div>
                  <Progress value={Math.min((metrics.product.orcamentos_generated / 50) * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Gestão de Obras</span>
                    <span className="text-sm">{metrics.product.obras_created} obras</span>
                  </div>
                  <Progress value={Math.min((metrics.product.obras_created / 20) * 100, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 💰 FINANCEIRO */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="MRR"
              value={`R$ ${metrics.business.mrr.toLocaleString()}`}
              description="Receita mensal"
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="ARR"
              value={`R$ ${metrics.business.arr.toLocaleString()}`}
              description="Receita anual"
              icon={TrendingUp}
              color="purple"
            />
            <MetricCard
              title="CAC"
              value={`R$ ${metrics.business.cac}`}
              description="Custo de aquisição"
              icon={Target}
              color="red"
            />
            <MetricCard
              title="LTV"
              value={`R$ ${metrics.business.ltv.toLocaleString()}`}
              description="Valor do cliente"
              icon={Users}
              color="blue"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>📈 Distribuição de Planos</CardTitle>
              <CardDescription>Breakdown das assinaturas ativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.business.subscription_breakdown).map(([plan, count]) => {
                  const planNames = {
                    basic: 'Básico (R$ 97)',
                    professional: 'Profissional (R$ 197)',
                    enterprise: 'Empresarial (R$ 497)'
                  }
                  
                  const totalSubs = Object.values(metrics.business.subscription_breakdown).reduce((a, b) => a + b, 0)
                  const percentage = totalSubs > 0 ? (count / totalSubs) * 100 : 0

                  return (
                    <div key={plan} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {planNames[plan as keyof typeof planNames] || plan}
                        </span>
                        <span className="text-sm">{count} usuários ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">LTV/CAC Ratio:</span>
                  <span className="font-medium ml-2">
                    {(metrics.business.ltv / metrics.business.cac).toFixed(1)}x
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Assinantes:</span>
                  <span className="font-medium ml-2">
                    {Object.values(metrics.business.subscription_breakdown).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
      
      {/* 🤖 Widget de IA Flutuante */}
      <AIInsightsWidget
        metrics={metrics ? convertMetricsForAI(metrics) : null}
        isVisible={aiWidgetVisible}
        onToggle={() => setAiWidgetVisible(!aiWidgetVisible)}
      />
    </div>
  )
} 