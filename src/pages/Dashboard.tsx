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
  Building2,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useObras } from "@/hooks/useObras";
import { useDespesas } from "@/hooks/useDespesas";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { RecentProjects } from "@/components/dashboard/RecentProjects";

const Dashboard = () => {
  const { obras, isLoading: obrasLoading } = useObras();
  const { despesas, isLoading: despesasLoading } = useDespesas();
  const { notasFiscais, isLoading: notasLoading } = useNotasFiscais();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calcular métricas reais
  const totalObras = obras?.length || 0;
  const obrasAtivas = obras?.filter(obra => 
    obra.data_inicio && !obra.data_fim || 
    (obra.data_fim && new Date(obra.data_fim) > new Date())
  ).length || 0;

  const totalDespesas = despesas?.reduce((sum, despesa) => {
    // Compatibilidade: field custos pode ser 'custo' ou 'valor'
    const valorDespesa = (despesa as any).custo ?? (despesa as any).valor ?? (despesa as any).valor_unitario ?? 0;
    return sum + valorDespesa;
  }, 0) || 0;
  const totalDespesasCount = despesas?.length || 0;
  const despesasPendentes = totalDespesasCount; // Todas as despesas são consideradas pendentes por padrão

  const totalNotas = notasFiscais?.length || 0;
  const valorNotas = notasFiscais?.reduce((sum, nota) => {
    // Verificação de tipo para garantir que nota tem a propriedade valor_total
    if (nota && typeof nota === 'object' && 'valor_total' in nota && typeof nota.valor_total === 'number') {
      return sum + nota.valor_total;
    }
    return sum;
  }, 0) || 0;

  const orcamentoTotal = obras?.reduce((sum, obra) => {
    const orc = (obra as any).orcamento_total ?? (obra as any).orcamento ?? 0;
    return sum + orc;
  }, 0) || 0;
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
    const totalGastoObra = despesasObra.reduce((sum, d) => {
      const v = (d as any).custo ?? (d as any).valor ?? (d as any).valor_unitario ?? 0;
      return sum + v;
    }, 0);
    const orcObra = (obra as any).orcamento_total ?? (obra as any).orcamento ?? 0;
    const progressoReal = orcObra > 0 ? Math.min(Math.round((totalGastoObra / orcObra) * 100), 100) : 0;
    
    return {
      id: obra.id,
      name: obra.nome,
      status: obra.data_inicio ? "em_andamento" : "planejamento",
      progress: progressoReal,
      deadline: obra.data_fim ? formatDateBR(obra.data_fim) : "Não definido",
      priority: "média",
      budget: orcObra,
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardOverview />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <RecentProjects />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Acesse as funcionalidades mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" asChild>
                    <Link to="/dashboard/obras/nova">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">Nova Obra</span>
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
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" asChild>
                    <Link to="/dashboard/construtoras/nova">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium">Nova Construtora</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" asChild>
                    <Link to="/dashboard/alertas">
                      <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="font-medium">Alertas de Desvio</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
