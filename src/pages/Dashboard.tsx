import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { useAuth } from "@/contexts/auth/hooks";
import { t } from "@/lib/i18n";
import { 
  Building, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Dados mockados para demonstração
  const metrics = [
    {
      title: "Obras Ativas",
      value: "12",
      description: "3 novas este mês",
      icon: Building,
      trend: { value: 25, isPositive: true },
      iconColor: "primary" as const
    },
    {
      title: "Faturamento Mensal",
      value: "R$ 247.500",
      description: "Meta: R$ 300.000",
      icon: DollarSign,
      trend: { value: 15, isPositive: true },
      iconColor: "success" as const
    },
    {
      title: "Despesas",
      value: "R$ 89.750",
      description: "36% do faturamento",
      icon: TrendingUp,
      trend: { value: 8, isPositive: false },
      iconColor: "warning" as const
    },
    {
      title: "Prazo Médio",
      value: "45 dias",
      description: "Para conclusão",
      icon: Clock,
      trend: { value: 12, isPositive: true },
      iconColor: "info" as const
    }
  ];

  const recentProjects = [
    {
      name: "Edifício Aurora",
      status: "em_andamento",
      progress: 65,
      deadline: "25/06/2024",
      priority: "alta"
    },
    {
      name: "Condomínio Marina",
      status: "em_andamento",
      progress: 80,
      deadline: "15/07/2024",
      priority: "média"
    },
    {
      name: "Shopping Plaza",
      status: "planejamento",
      progress: 15,
      deadline: "30/08/2024",
      priority: "baixa"
    }
  ];

  const pendingTasks = [
    {
      title: "Revisar orçamento",
      description: "Edifício Aurora - Vencimento: 25/05",
      priority: "alta",
      icon: FileText
    },
    {
      title: "Aprovar notas fiscais",
      description: "5 notas pendentes",
      priority: "média",
      icon: CheckCircle
    },
    {
      title: "Atualizar cronograma",
      description: "Condomínio Marina - Vencimento: 30/05",
      priority: "média",
      icon: Calendar
    },
    {
      title: "Contatar fornecedor",
      description: "Atraso na entrega de material",
      priority: "alta",
      icon: AlertCircle
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
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
            <Card className="h-full glass-effect">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Obras Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate("/dashboard/obras")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {project.name}
                        </h4>
                        <Badge variant={priorityColors[project.priority as keyof typeof priorityColors]}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={cn("h-full", statusColors[project.status as keyof typeof statusColors])}
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Prazo</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {project.deadline}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tarefas Pendentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full glass-effect">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Tarefas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pendingTasks.map((task, index) => {
                    const Icon = task.icon;
                    return (
                      <motion.li
                        key={task.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                            task.priority === "alta" ? "bg-red-500/10" : "bg-yellow-500/10",
                            "group-hover:scale-110"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              task.priority === "alta" ? "text-red-500" : "text-yellow-500"
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          </div>
                          <Badge 
                            variant={priorityColors[task.priority as keyof typeof priorityColors]}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
