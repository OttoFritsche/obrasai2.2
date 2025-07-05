/**
 * 📊 Dashboard de Métricas de Loading
 * 
 * Componente para monitoramento em tempo real das operações de loading,
 * análise de performance e métricas de uso do sistema.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { AnimatePresence,motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
  Zap} from 'lucide-react';
import React, { useEffect,useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPriority,useLoading, useLoadingMetrics } from '@/contexts/LoadingContext';

interface LoadingOperation {
  key: string;
  startTime: number;
  duration?: number;
  priority: LoadingPriority;
  group?: string;
  metadata?: Record<string, unknown>;
  status: 'active' | 'completed' | 'error';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  color: 'green' | 'yellow' | 'red' | 'blue';
}

interface LoadingAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  operation?: string;
}

export const LoadingMetricsDashboard: React.FC = () => {
  const { getMetrics, getHighestPriority, hasCriticalLoading } = useLoadingMetrics();
  const { isLoading } = useLoading();
  
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<LoadingAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Atualizar métricas em tempo real
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const metrics = getMetrics();
      const currentTime = Date.now();
      
      // Atualizar operações ativas
      const activeOps: LoadingOperation[] = Object.entries(metrics.activeOperations).map(([key, data]) => ({
        key,
        startTime: data.startTime,
        duration: currentTime - data.startTime,
        priority: data.priority,
        group: data.group,
        metadata: data.metadata,
        status: 'active'
      }));
      
      setOperations(activeOps);
      
      // Calcular métricas de performance
      const avgDuration = metrics.averageDuration;
      const totalOps = metrics.totalOperations;
      const activeCount = metrics.activeCount;
      
      const newPerformanceMetrics: PerformanceMetric[] = [
        {
          name: 'Operações Ativas',
          value: activeCount,
          unit: 'ops',
          trend: activeCount > 5 ? 'up' : activeCount < 2 ? 'down' : 'neutral',
          trendValue: activeCount,
          color: activeCount > 10 ? 'red' : activeCount > 5 ? 'yellow' : 'green'
        },
        {
          name: 'Duração Média',
          value: avgDuration,
          unit: 'ms',
          trend: avgDuration > 2000 ? 'up' : avgDuration < 500 ? 'down' : 'neutral',
          trendValue: avgDuration,
          color: avgDuration > 3000 ? 'red' : avgDuration > 1500 ? 'yellow' : 'green'
        },
        {
          name: 'Total de Operações',
          value: totalOps,
          unit: 'total',
          trend: 'up',
          trendValue: totalOps,
          color: 'blue'
        },
        {
          name: 'Prioridade Máxima',
          value: getHighestPriority() || 0,
          unit: 'level',
          trend: hasCriticalLoading() ? 'up' : 'neutral',
          trendValue: getHighestPriority() || 0,
          color: hasCriticalLoading() ? 'red' : 'green'
        }
      ];
      
      setPerformanceMetrics(newPerformanceMetrics);
      
      // Gerar alertas baseados nas métricas
      const newAlerts: LoadingAlert[] = [];
      
      if (activeCount > 10) {
        newAlerts.push({
          id: `high-load-${Date.now()}`,
          type: 'warning',
          message: `Alto número de operações ativas: ${activeCount}`,
          timestamp: new Date()
        });
      }
      
      if (avgDuration > 3000) {
        newAlerts.push({
          id: `slow-ops-${Date.now()}`,
          type: 'error',
          message: `Operações lentas detectadas: ${avgDuration.toFixed(0)}ms em média`,
          timestamp: new Date()
        });
      }
      
      if (hasCriticalLoading()) {
        newAlerts.push({
          id: `critical-loading-${Date.now()}`,
          type: 'error',
          message: 'Operações críticas em andamento',
          timestamp: new Date()
        });
      }
      
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Manter apenas os 10 alertas mais recentes
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, getMetrics, getHighestPriority, hasCriticalLoading]);

  const getPriorityColor = (priority: LoadingPriority) => {
    switch (priority) {
      case LoadingPriority.CRITICAL: return 'bg-red-500';
      case LoadingPriority.HIGH: return 'bg-orange-500';
      case LoadingPriority.NORMAL: return 'bg-blue-500';
      case LoadingPriority.LOW: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: LoadingPriority) => {
    switch (priority) {
      case LoadingPriority.CRITICAL: return 'Crítica';
      case LoadingPriority.HIGH: return 'Alta';
      case LoadingPriority.NORMAL: return 'Normal';
      case LoadingPriority.LOW: return 'Baixa';
      default: return 'Desconhecida';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'Operações Ativas': return Activity;
      case 'Duração Média': return Timer;
      case 'Total de Operações': return BarChart3;
      case 'Prioridade Máxima': return Zap;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Loading</h2>
          <p className="text-gray-600">Monitoramento em tempo real das operações de carregamento</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
          
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex items-center gap-2"
          >
            {isMonitoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Monitorando
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Pausado
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const Icon = getMetricIcon(metric.name);
          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(metric.name === 'Duração Média' ? 0 : 0)} {metric.unit}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                    {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                    {metric.trend === 'neutral' && <div className="h-3 w-3" />}
                    <span className={`${
                      metric.color === 'red' ? 'text-red-500' :
                      metric.color === 'yellow' ? 'text-yellow-500' :
                      metric.color === 'green' ? 'text-green-500' :
                      'text-blue-500'
                    }`}>
                      {metric.trend !== 'neutral' && (
                        metric.name === 'Duração Média' ? formatDuration(metric.trendValue) : metric.trendValue
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Operações Ativas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Operações em Andamento ({operations.length})
              </CardTitle>
              <CardDescription>
                Lista de todas as operações de loading ativas no momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhuma operação ativa no momento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {operations.map((op) => (
                      <motion.div
                        key={op.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(op.priority)}`} />
                          <div>
                            <p className="font-medium">{op.key}</p>
                            <p className="text-sm text-gray-500">
                              {op.group && `Grupo: ${op.group} • `}
                              Duração: {formatDuration(op.duration || 0)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getPriorityLabel(op.priority)}
                          </Badge>
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas do Sistema ({alerts.length})
              </CardTitle>
              <CardDescription>
                Notificações sobre performance e problemas detectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum alerta ativo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className={`${
                      alert.type === 'error' ? 'border-red-200 bg-red-50' :
                      alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.type === 'error' ? 'text-red-500' :
                        alert.type === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <AlertDescription className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <span className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics de Performance
              </CardTitle>
              <CardDescription>
                Análise detalhada do comportamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Distribuição por Prioridade */}
                <div>
                  <h4 className="font-medium mb-3">Distribuição por Prioridade</h4>
                  <div className="space-y-2">
                    {Object.values(LoadingPriority).map((priority) => {
                      const count = operations.filter(op => op.priority === priority).length;
                      const percentage = operations.length > 0 ? (count / operations.length) * 100 : 0;
                      
                      return (
                        <div key={priority} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`} />
                          <span className="text-sm font-medium w-20">{getPriorityLabel(priority)}</span>
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm text-gray-500 w-12">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estatísticas Gerais */}
                <div>
                  <h4 className="font-medium mb-3">Estatísticas da Sessão</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operações mais longas:</span>
                      <span className="font-medium">
                        {operations.length > 0 ? formatDuration(Math.max(...operations.map(op => op.duration || 0))) : '0ms'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grupos ativos:</span>
                      <span className="font-medium">
                        {new Set(operations.map(op => op.group).filter(Boolean)).size}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingMetricsDashboard;