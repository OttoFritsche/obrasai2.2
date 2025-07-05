import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft,Bell, Filter, Loader2, Settings, TrendingUp } from 'lucide-react';
import React from 'react';
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardAlertasAvancados } from '@/components/AlertasAvancados';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAlerts } from '@/hooks/useAdvancedAlerts';
import { useObras } from '@/hooks/useObras';
import { cn } from '@/lib/utils';

const AlertasAvancadosPage: React.FC = () => {
  const [selectedObraId, setSelectedObraId] = useState<string>('all');
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const { obras } = useObras();
  const navigate = useNavigate();
  const { 
    notificacoes, 
    historico, 
    configuracoes,
    loading, 
    error, 
    carregarNotificacoes,
    carregarHistorico,
    carregarConfiguracoes
  } = useAdvancedAlerts();

  // Carregar dados iniciais
  useEffect(() => {
    carregarConfiguracoes();
    carregarNotificacoes();
    carregarHistorico();
  }, []);

  // Calcular métricas para os cards
  const totalNotificacoes = notificacoes?.length || 0;
  const notificacoesNaoLidas = notificacoes?.filter(n => !n.lida)?.length || 0;
  const totalAlertas = historico?.length || 0;
  const alertasRecentes = historico?.slice(0, 5) || [];

  // Calcular tendências (simuladas para exemplo)
  const trendNotificacoes = { value: 12, isPositive: true };
  const trendAlertas = { value: 8, isPositive: true };

  if (loading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-muted-foreground">Carregando alertas avançados...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 space-y-4"
        >
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Erro ao carregar alertas</h3>
            <p className="text-muted-foreground">Não foi possível carregar os alertas avançados.</p>
          </div>
          <Button onClick={() => {
            carregarNotificacoes();
            carregarHistorico();
            carregarConfiguracoes();
          }} variant="outline">
            Tentar novamente
          </Button>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Button
               variant="ghost"
               size="sm"
               onClick={() => navigate('/dashboard/alertas')}
               className="mr-2 text-muted-foreground hover:text-foreground"
             >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Alertas Avançados</h1>
              <p className="text-sm text-muted-foreground">
                Sistema avançado de alertas com notificações em tempo real
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={() => setMostrarConfiguracoes(true)}
              className={cn(
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "text-white shadow-lg",
                "transition-all duration-300"
              )}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Alertas
            </Button>
          </motion.div>
        </div>

        {/* Cards de métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Total de Alertas"
            value={totalAlertas.toString()}
            icon={Bell}
            trend={trendAlertas}
            iconColor="primary"
            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <MetricCard
            title="Alertas Recentes"
            value={alertasRecentes.length.toString()}
            icon={TrendingUp}
            trend={trendAlertas}
            iconColor="info"
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          />
          <MetricCard
            title="Total Notificações"
            value={totalNotificacoes.toString()}
            icon={Bell}
            trend={trendNotificacoes}
            iconColor="warning"
            className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700"
          />
          <MetricCard
            title="Não Lidas"
            value={notificacoesNaoLidas.toString()}
            icon={AlertTriangle}
            trend={trendNotificacoes}
            iconColor="destructive"
            className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700"
          />
        </motion.div>
        
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-blue-700 dark:text-blue-300">Filtros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                    Obra
                  </label>
                  <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                      <SelectValue placeholder="Todas as obras" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as obras</SelectItem>
                      {obras?.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id}>
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Componente principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <DashboardAlertasAvancados 
                data-dashboard-alertas 
                obraId={selectedObraId !== 'all' ? selectedObraId : undefined}
                mostrarConfiguracoes={mostrarConfiguracoes}
                onFecharConfiguracoes={() => setMostrarConfiguracoes(false)}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AlertasAvancadosPage;