/**
 * 📊 Dashboard de Monitoramento Contínuo
 * 
 * Sistema avançado de monitoramento que integra métricas de loading,
 * performance de formulários, operações assíncronas e alertas em tempo real.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Settings,
  TrendingDown,
  TrendingUp} from 'lucide-react';
import React, { useEffect, useMemo,useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoading } from '@/contexts/LoadingContext';

import LoadingMetricsDashboard from './LoadingMetricsDashboard';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: Date;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  source: string;
}

interface MonitoringConfig {
  refreshInterval: number; // em segundos
  alertThresholds: {
    loadingTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  enableRealTimeAlerts: boolean;
  autoRefresh: boolean;
}

const ContinuousMonitoringDashboard: React.FC = () => {
  const [config, setConfig] = useState<MonitoringConfig>({
    refreshInterval: 30,
    alertThresholds: {
      loadingTime: 3000, // 3 segundos
      errorRate: 5, // 5%
      memoryUsage: 80 // 80%
    },
    enableRealTimeAlerts: true,
    autoRefresh: true
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  const { getLoadingMetrics, getActiveOperations } = useLoading();

  // Métricas de performance simuladas (em produção, viriam de APIs reais)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'avg-loading-time',
      name: 'Tempo Médio de Loading',
      value: 1200,
      unit: 'ms',
      trend: 'down',
      status: 'good',
      threshold: { warning: 2000, critical: 3000 },
      lastUpdated: new Date()
    },
    {
      id: 'error-rate',
      name: 'Taxa de Erro',
      value: 2.1,
      unit: '%',
      trend: 'stable',
      status: 'good',
      threshold: { warning: 5, critical: 10 },
      lastUpdated: new Date()
    },
    {
      id: 'form-completion-rate',
      name: 'Taxa de Conclusão de Formulários',
      value: 87.5,
      unit: '%',
      trend: 'up',
      status: 'good',
      threshold: { warning: 70, critical: 50 },
      lastUpdated: new Date()
    },
    {
      id: 'api-response-time',
      name: 'Tempo de Resposta da API',
      value: 450,
      unit: 'ms',
      trend: 'up',
      status: 'warning',
      threshold: { warning: 500, critical: 1000 },
      lastUpdated: new Date()
    }
  ]);

  // Simular atualizações de métricas
  useEffect(() => {
    if (!config.autoRefresh || !isMonitoring) return;

    const interval = setInterval(() => {
      setPerformanceMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * (metric.value * 0.1),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
        lastUpdated: new Date()
      })));
      setLastRefresh(new Date());
    }, config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval, isMonitoring]);

  // Gerar alertas baseados nas métricas
  useEffect(() => {
    if (!config.enableRealTimeAlerts) return;

    performanceMetrics.forEach(metric => {
      if (metric.status === 'critical' || metric.status === 'warning') {
        const existingAlert = alerts.find(alert => 
          alert.source === metric.id && !alert.resolved
        );

        if (!existingAlert) {
          const newAlert: SystemAlert = {
            id: `${metric.id}-${Date.now()}`,
            type: metric.status === 'critical' ? 'error' : 'warning',
            title: `${metric.name} ${metric.status === 'critical' ? 'Crítico' : 'Atenção'}`,
            message: `${metric.name} está em ${metric.value.toFixed(1)}${metric.unit}, acima do limite ${metric.status === 'critical' ? 'crítico' : 'de atenção'}.`,
            timestamp: new Date(),
            resolved: false,
            source: metric.id
          };

          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Manter apenas 10 alertas
        }
      }
    });
  }, [performanceMetrics, config.enableRealTimeAlerts]);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Activity;
      default: return Activity;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const loadingMetrics = getLoadingMetrics();
  const activeOperations = getActiveOperations();

  const systemHealthScore = useMemo(() => {
    const goodMetrics = performanceMetrics.filter(m => m.status === 'good').length;
    const totalMetrics = performanceMetrics.length;
    return Math.round((goodMetrics / totalMetrics) * 100);
  }, [performanceMetrics]);

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: systemHealthScore,
      performanceMetrics,
      alerts: alerts.slice(0, 20),
      loadingMetrics,
      activeOperations: activeOperations.length,
      config
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Monitoramento Contínuo</h2>
          <p className="text-muted-foreground">
            Sistema de monitoramento em tempo real • Última atualização: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`${isMonitoring ? 'text-green-600' : 'text-gray-600'}`}
          >
            {isMonitoring ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {isMonitoring ? 'Monitorando' : 'Pausado'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Status geral do sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status do Sistema
              </CardTitle>
              <CardDescription>Visão geral da saúde do sistema</CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{systemHealthScore}%</div>
              <div className="text-sm text-muted-foreground">Saúde Geral</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{performanceMetrics.filter(m => m.status === 'good').length}</div>
              <div className="text-sm text-muted-foreground">Métricas OK</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{performanceMetrics.filter(m => m.status === 'warning').length}</div>
              <div className="text-sm text-muted-foreground">Atenção</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">{performanceMetrics.filter(m => m.status === 'critical').length}</div>
              <div className="text-sm text-muted-foreground">Crítico</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{activeOperations.length}</div>
              <div className="text-sm text-muted-foreground">Operações Ativas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas ativos */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas Ativos ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeAlerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.type === 'error' ? 'border-l-red-500' : 
                  alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métricas de Performance</TabsTrigger>
          <TabsTrigger value="loading">Loading & Operações</TabsTrigger>
          <TabsTrigger value="history">Histórico de Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric) => {
              const StatusIcon = getStatusIcon(metric.status);
              const TrendIcon = getTrendIcon(metric.trend);
              
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <TrendIcon className={`h-4 w-4 ${
                            metric.trend === 'up' ? 'text-green-500' : 
                            metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`} />
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.value.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">{metric.unit}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                            {metric.status === 'good' ? 'Normal' : metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Atualizado: {metric.lastUpdated.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Limites: Atenção {metric.threshold.warning}{metric.unit} • Crítico {metric.threshold.critical}{metric.unit}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="loading">
          <LoadingMetricsDashboard />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alertas</CardTitle>
              <CardDescription>Todos os alertas gerados nas últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum alerta registrado</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.type === 'error' ? 'bg-red-500' : 
                            alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <span className="font-medium">{alert.title}</span>
                          {alert.resolved && <Badge variant="outline">Resolvido</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContinuousMonitoringDashboard;