import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building, 
  Pencil, 
  Clock, 
  Calendar, 
  DollarSign, 
  MapPin, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Calculator,
  Plus,
  Receipt
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { obrasApi } from "@/services/api";
import { orcamentosParametricosApi, orcamentoUtils } from "@/services/orcamentoApi";
import { STATUS_ORCAMENTO_LABELS, STATUS_ORCAMENTO_CORES, TIPO_OBRA_LABELS } from "@/lib/validations/orcamento";

import InsightsObra from "@/components/ai/InsightsObra";
import InterfaceChat from "@/components/ai/InterfaceChat";

const ObraDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("detalhes");

  const { data: obra, isLoading, isError, refetch } = useQuery({
    queryKey: ["obra", id],
    queryFn: async () => {
      const result = await obrasApi.getById(id!);
      return result;
    },
    enabled: !!id,
    // ✅ Garantir que sempre busque dados frescos quando necessário
    staleTime: 30 * 1000, // 30 segundos
    cacheTime: 5 * 60 * 1000 // 5 minutos
  });

  // Query para orçamentos relacionados
  const { data: orcamentosRelacionados } = useQuery({
    queryKey: ["orcamentos-obra", id],
    queryFn: () => orcamentosParametricosApi.getByObra(id!),
    enabled: !!id,
  });

  // Query para despesas da obra (dados reais)
  const { data: despesasObra, isLoading: isLoadingDespesas } = useQuery({
    queryKey: ["despesas-obra", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da obra é obrigatório");
      
      const { data, error } = await supabase
        .from("despesas")
        .select(`
          id,
          descricao,
          custo,
          data_despesa,
          pago,
          categoria,
          quantidade,
          valor_unitario
        `)
        .eq("obra_id", id)
        .order("data_despesa", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar despesas:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id,
  });

  // ====================================
  // 🧮 CÁLCULOS DE MÉTRICAS REAIS
  // ====================================

  /**
   * Calcula progresso real da obra baseado em cronograma
   */
  const calcularProgressoObra = () => {
    if (!obra?.data_inicio || !obra?.data_prevista_termino) {
      return 0; // ✅ Retorna 0% em vez de undefined
    }
    
    try {
      const dataInicio = new Date(obra.data_inicio);
      const dataFim = new Date(obra.data_prevista_termino);
      const hoje = new Date();
      
      // Se ainda não começou, progresso = 0%
      if (hoje < dataInicio) {
        return 0;
      }
      
      // Se já terminou, progresso = 100%
      if (hoje > dataFim) {
        return 100;
      }
      
      const duracaoTotal = dataFim.getTime() - dataInicio.getTime();
      const tempoDecorrido = hoje.getTime() - dataInicio.getTime();
      
      const progresso = Math.max(0, Math.min(100, (tempoDecorrido / duracaoTotal) * 100));
      
      return Math.round(progresso);
    } catch (error) {
      console.error("❌ Erro ao calcular progresso:", error);
      return 0;
    }
  };

  /**
   * Calcula total gasto real baseado nas despesas
   */
  const calcularTotalGastos = () => {
    if (!despesasObra) return 0;
    
    return despesasObra.reduce((total, despesa) => {
      // Usar campo 'custo' que é valor_unitario * quantidade
      return total + (despesa.custo || 0);
    }, 0);
  };

  /**
   * Calcula percentual gasto em relação ao orçamento
   */
  const calcularPercentualGasto = () => {
    if (!obra?.orcamento || obra.orcamento === 0) return null;
    
    const percentual = (totalGastos / obra.orcamento) * 100;
    return Math.round(percentual * 100) / 100; // 2 casas decimais
  };

  /**
   * Calcula dias restantes até conclusão
   */
  const calcularDiasRestantes = () => {
    if (!obra?.data_inicio || !obra?.data_prevista_termino) {
      return null;
    }
    
    try {
      const dataInicio = new Date(obra.data_inicio);
      const dataFim = new Date(obra.data_prevista_termino);
      const hoje = new Date();
      
      // Calcular duração total da obra
      const duracaoTotal = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
      
      // Se ainda não começou, retorna duração total
      if (hoje < dataInicio) {
        return duracaoTotal;
      }
      
      // Calcular dias restantes até o fim
      const diffTime = dataFim.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diasRestantes;
    } catch (error) {
      console.error("❌ Erro ao calcular dias restantes:", error);
      return null;
    }
  };



  // Métricas calculadas
  const progressoReal = calcularProgressoObra();
  const totalGastos = calcularTotalGastos();
  const diasRestantes = calcularDiasRestantes();
  const percentualGasto = calcularPercentualGasto();



  const tabs = [
    { id: "detalhes", label: "Detalhes", icon: Building, color: "text-blue-500" },
    { id: "insights", label: "Insights IA", icon: TrendingUp, color: "text-blue-500" },
    { id: "chat", label: "Chat IA", icon: MessageSquare, color: "text-green-500" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-muted-foreground">Carregando detalhes da obra...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (isError || !obra) {
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
            <h3 className="text-lg font-semibold">Erro ao carregar obra</h3>
            <p className="text-muted-foreground">Não foi possível encontrar os dados da obra solicitada.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/obras")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard/obras")}
              className="hover:bg-blue-500/10 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{obra.nome}</h1>
                <p className="text-sm text-muted-foreground">
                  {obra.cidade}, {obra.estado}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/orcamentos/novo?obra_id=${id}&return=/dashboard/obras/${id}`)}
              className="group hover:border-green-500/50 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
            >
              <Calculator className="h-4 w-4 mr-2 transition-colors group-hover:text-green-500" />
              Orçamento IA
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/despesas/nova?obra_id=${id}&return=/dashboard/obras/${id}`)}
              className="group hover:border-blue-500/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
            >
              <Plus className="h-4 w-4 mr-1 transition-colors group-hover:text-blue-500" />
              <Receipt className="h-3 w-3 mr-2 transition-colors group-hover:text-blue-500" />
              Nova Despesa
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/dashboard/obras/${id}/editar`)}
                              className="group hover:border-blue-500/50"
            >
                              <Pencil className="h-4 w-4 mr-2 transition-colors group-hover:text-blue-500" />
              Editar Obra
            </Button>
          </motion.div>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Em Andamento
          </Badge>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <Icon className={cn("h-4 w-4", tab.color)} />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="detalhes" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-500" />
                        </div>
                        Informações de Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3">
                        <div className="flex justify-between items-start">
                          <dt className="text-sm text-muted-foreground">Endereço</dt>
                          <dd className="text-right max-w-[60%] font-medium">{obra.endereco}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground">Cidade</dt>
                          <dd className="font-medium">{obra.cidade}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground">Estado</dt>
                          <dd className="font-medium">{obra.estado}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground">CEP</dt>
                          <dd className="font-mono text-sm">{obra.cep}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-500" />
                          </div>
                          Cronograma e Orçamento
                        </div>
                        {(!obra.data_inicio || !obra.data_prevista_termino) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/obras/${id}/editar`)}
                            className="text-xs text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Definir Datas
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3">
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Data de Início
                          </dt>
                          <dd className="font-medium">
                            {obra.data_inicio ? (
                              formatDateBR(obra.data_inicio)
                            ) : (
                              <span className="text-muted-foreground text-sm italic">
                                Não definida
                              </span>
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Previsão de Término
                          </dt>
                          <dd className="font-medium">
                            {obra.data_prevista_termino ? (
                              formatDateBR(obra.data_prevista_termino)
                            ) : (
                              <span className="text-muted-foreground text-sm italic">
                                Não definida
                              </span>
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <dt className="text-sm text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            Orçamento Total
                          </dt>
                          <dd className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrencyBR(obra.orcamento)}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Cards de métricas com dados reais */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Card Progresso - Baseado no cronograma */}
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <p className="text-xl font-bold">
                          {`${progressoReal}%`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {obra?.data_inicio && obra?.data_prevista_termino 
                            ? "Baseado no cronograma"
                            : "Aguardando datas da obra"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Gastos - Baseado nas despesas reais */}
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        {isLoadingDespesas ? (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : (
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gastos Reais</p>
                        <p className="text-xl font-bold">
                          {isLoadingDespesas ? (
                            <span className="text-muted-foreground">Carregando...</span>
                          ) : (
                            formatCurrencyBR(totalGastos)
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isLoadingDespesas ? (
                            "Buscando despesas..."
                          ) : (
                            <>
                              {`${despesasObra?.length || 0} despesa(s)`}
                              {percentualGasto !== null && obra?.orcamento && (
                                <span className={cn(
                                  "ml-2 font-medium",
                                  percentualGasto > 100 ? "text-red-500" : 
                                  percentualGasto > 80 ? "text-amber-500" : "text-green-500"
                                )}>
                                  ({percentualGasto}% do orçado)
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Dias Restantes - Calculado da data fim */}
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dias Restantes</p>
                        <p className="text-xl font-bold">
                          {diasRestantes !== null ? (
                            diasRestantes > 0 ? (
                              diasRestantes
                            ) : diasRestantes === 0 ? (
                              "Hoje"
                            ) : (
                              <span className="text-red-500">
                                {Math.abs(diasRestantes)} em atraso
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground text-base">
                              Sem prazo
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {obra?.data_prevista_termino 
                            ? `Até ${formatDateBR(obra.data_prevista_termino)}`
                            : "Defina datas da obra"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Seção de Orçamentos Relacionados */}
              {orcamentosRelacionados && orcamentosRelacionados.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-green-500" />
                        </div>
                        Orçamentos Paramétricos
                        <Badge variant="secondary" className="ml-auto">
                          {orcamentosRelacionados.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {orcamentosRelacionados.map((orcamento) => (
                          <div
                            key={orcamento.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/dashboard/orcamentos/${orcamento.id}`)}
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{orcamento.nome_orcamento}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {TIPO_OBRA_LABELS[orcamento.tipo_obra]}
                                </Badge>
                                <span>•</span>
                                <span>{orcamento.area_total} m²</span>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-bold text-green-600 dark:text-green-400">
                                {orcamentoUtils.formatarValor(orcamento.custo_estimado)}
                              </p>
                              <Badge 
                                className={cn(
                                  "text-xs",
                                  STATUS_ORCAMENTO_CORES[orcamento.status]
                                )}
                              >
                                {STATUS_ORCAMENTO_LABELS[orcamento.status]}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InsightsObra obraId={id!} />
              </motion.div>
            </TabsContent>

            <TabsContent value="chat" className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InterfaceChat obraId={id!} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ObraDetalhe;
