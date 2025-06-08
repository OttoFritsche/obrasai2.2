import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  FileText, 
  CheckCircle, 
  Calendar, 
  AlertCircle,
  Receipt,
  Users,
  Sparkles,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useObras } from "@/hooks/useObras";
import { useDespesas } from "@/hooks/useDespesas";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { obras, isLoading: obrasLoading } = useObras();
  const { despesas, isLoading: despesasLoading } = useDespesas();
  const { notasFiscais, isLoading: notasLoading } = useNotasFiscais();
  const navigate = useNavigate();

  // Calcular métricas reais
  const totalObras = obras?.length || 0;
  const obrasAtivas = obras?.filter(obra => 
    obra.data_inicio && !obra.data_prevista_termino || 
    (obra.data_prevista_termino && new Date(obra.data_prevista_termino) > new Date())
  ).length || 0;

  const totalDespesas = despesas?.reduce((sum, despesa) => sum + despesa.custo, 0) || 0;
  const despesasPagas = despesas?.filter(d => d.pago).length || 0;
  const despesasPendentes = despesas?.filter(d => !d.pago).length || 0;

  const totalNotas = notasFiscais?.length || 0;
  const valorNotas = notasFiscais?.reduce((sum, nota) => sum + nota.valor_total, 0) || 0;

  const orcamentoTotal = obras?.reduce((sum, obra) => sum + obra.orcamento, 0) || 0;
  const percentualGasto = orcamentoTotal > 0 ? (totalDespesas / orcamentoTotal * 100) : 0;

  // Métricas principais com dados reais
  const metrics = [
    {
      title: "Obras Ativas",
      value: obrasAtivas.toString(),
      description: `${totalObras} total`,
      icon: Building,
      trend: { value: 0, isPositive: true },
      iconColor: "primary" as const
    },
    {
      title: "Total Investido",
      value: formatCurrencyBR(orcamentoTotal),
      description: `${totalObras} obras`,
      icon: DollarSign,
      trend: { value: 0, isPositive: true },
      iconColor: "success" as const
    },
    {
      title: "Despesas",
      value: formatCurrencyBR(totalDespesas),
      description: `${percentualGasto.toFixed(1)}% do orçamento`,
      icon: TrendingUp,
      trend: { value: 0, isPositive: false },
      iconColor: "warning" as const
    },
    {
      title: "Notas Fiscais",
      value: totalNotas.toString(),
      description: formatCurrencyBR(valorNotas),
      icon: Receipt,
      trend: { value: 0, isPositive: true },
      iconColor: "info" as const
    }
  ];

  // Obras recentes (limitadas a 3)
  const recentProjects = obras?.slice(0, 3).map(obra => {
    // Calcular progresso real baseado em despesas vs orçamento
    const despesasObra = despesas?.filter(d => d.obra_id === obra.id) || [];
    const totalGastoObra = despesasObra.reduce((sum, d) => sum + d.custo, 0);
    const progressoReal = obra.orcamento > 0 ? Math.min(Math.round((totalGastoObra / obra.orcamento) * 100), 100) : 0;
    
    return {
      id: obra.id,
      name: obra.nome,
      status: obra.data_inicio ? "em_andamento" : "planejamento",
      progress: progressoReal,
      deadline: obra.data_prevista_termino ? formatDateBR(obra.data_prevista_termino) : "Não definido",
      priority: "média",
      budget: obra.orcamento,
      city: obra.cidade,
      state: obra.estado
    };
  }) || [];

  // Tarefas pendentes baseadas em dados reais
  const pendingTasks = [
    ...(despesasPendentes > 0 ? [{
      title: "Despesas pendentes",
      description: `${despesasPendentes} despesas aguardando pagamento`,
      priority: "alta" as const,
      icon: AlertCircle,
      link: "/dashboard/despesas"
    }] : []),
    ...(totalNotas === 0 && totalDespesas > 0 ? [{
      title: "Cadastrar notas fiscais",
      description: "Há despesas sem notas fiscais vinculadas",
      priority: "média" as const,
      icon: FileText,
      link: "/dashboard/notas"
    }] : []),
    ...(totalObras === 0 ? [{
      title: "Cadastrar primeira obra",
      description: "Comece criando sua primeira obra",
      priority: "alta" as const,
      icon: Building,
      link: "/dashboard/obras/nova"
    }] : [])
  ];

  const priorityColors = {
    alta: "destructive",
    média: "warning",
    baixa: "default"
  };

  const statusColors = {
    em_andamento: "bg-blue-500",
    planejamento: "bg-yellow-500",
    concluido: "bg-green-500"
  };

  const isLoading = obrasLoading || despesasLoading || notasLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header de boas-vindas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {totalObras === 0 
              ? "Bem-vindo! Comece criando sua primeira obra." 
              : `Acompanhe o progresso de suas ${totalObras} obras.`
            }
          </p>
        </motion.div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projetos Recentes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                    <Building className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="text-blue-700 dark:text-blue-300">Obras Recentes</span>
                </CardTitle>
                <Button variant="outline" size="sm" asChild className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Link to="/dashboard/obras">Ver todas</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                      <Building className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-700 dark:text-slate-300">Nenhuma obra cadastrada</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Comece criando sua primeira obra
                      </p>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Link to="/dashboard/obras/nova">Criar Obra</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${statusColors[project.status]}`} />
                          <div>
                            <h4 className="font-medium text-slate-700 dark:text-slate-300">{project.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {project.city}/{project.state} • <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrencyBR(project.budget)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{project.deadline}</p>
                          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600">
                            {project.status === "em_andamento" ? "Em andamento" : "Planejamento"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tarefas Pendentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-300">Ações Necessárias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-emerald-700 dark:text-emerald-300">Tudo em dia!</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Não há tarefas pendentes no momento
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <task.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">{task.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                        </div>
                        <Badge 
                          variant={priorityColors[task.priority] as "default" | "secondary" | "destructive" | "outline"}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 dark:from-amber-900/10 dark:to-yellow-900/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <span className="text-amber-700 dark:text-amber-300">Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" asChild>
                  <Link to="/dashboard/obras/nova">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Nova Obra</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" asChild>
                  <Link to="/dashboard/despesas/nova">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-medium">Nova Despesa</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" asChild>
                  <Link to="/dashboard/fornecedores/pj">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Fornecedores</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-[#daa916]/30 dark:border-[#daa916]/50 text-[#daa916] dark:text-[#daa916] hover:bg-[#daa916]/10 dark:hover:bg-[#daa916]/20 transition-colors" asChild>
                  <Link to="/dashboard/orcamentos">
                    <div className="h-10 w-10 rounded-lg bg-[#daa916]/20 dark:bg-[#daa916]/30 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-[#daa916] dark:text-[#daa916]" />
                    </div>
                    <span className="font-medium">Orçamentos IA</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-[#182b4d]/30 dark:border-[#daa916]/50 text-[#182b4d] dark:text-[#daa916] hover:bg-[#182b4d]/10 dark:hover:bg-[#daa916]/20 transition-colors" asChild>
                  <Link to="/dashboard/chat">
                    <div className="h-10 w-10 rounded-lg bg-[#182b4d]/20 dark:bg-[#daa916]/30 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-[#182b4d] dark:text-[#daa916]" />
                    </div>
                    <span className="font-medium">Chat IA</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-cyan-200 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors" asChild>
                  <Link to="/dashboard/plantas">
                    <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Building className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="font-medium">Plantas IA</span>
                  </Link>
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/construtoras/nova')}
                  className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Nova Construtora
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
