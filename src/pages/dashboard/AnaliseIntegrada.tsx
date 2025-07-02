/**
 * 📊 Dashboard de Análise Integrada
 * 
 * Dashboard que combina dados de Obras, Orçamentos IA e Despesas
 * para fornecer uma visão unificada e análises comparativas.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target,
  Zap,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrencyBR } from "@/lib/i18n";
import { useObras } from "@/hooks/useObras";
import { useDespesas } from "@/hooks/useDespesas";
import { orcamentosParametricosApi } from "@/services/orcamentoApi";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface AnaliseObra {
  obra: {
    id: string;
    nome: string;
    orcamento: number;
    cidade: string;
    estado: string;
    data_inicio?: string;
    data_prevista_termino?: string;
  };
  orcamentoIA?: {
    id: string;
    nome_orcamento: string;
    custo_estimado: number;
    status: string;
    created_at: string;
    data_calculo: string;
    tipo_obra: string;
    padrao_obra: string;
    area_total: number;
    custo_m2: number;
    margem_erro_estimada: number;
    confianca_estimativa: number;
  };
  despesas: {
    total: number;
    pagas: number;
    pendentes: number;
    quantidade: number;
  };
  analise: {
    saldoDisponivel: number;
    percentualGasto: number;
    percentualDisponivel: number;
    desvioOrcamentoIA: number;
    eficiencia: number;
    status: 'otimo' | 'bom' | 'atencao' | 'critico';
    alertas: string[];
  };
}

interface MetricaGeral {
  titulo: string;
  valor: string;
  variacao?: number;
  icone: React.ElementType;
  cor: string;
  descricao: string;
}

// ====================================
// 🎯 COMPONENTE PRINCIPAL
// ====================================

const AnaliseIntegrada: React.FC = () => {
  const navigate = useNavigate();
  const [tabAtiva, setTabAtiva] = useState("visao-geral");
  
  // Hooks para dados
  const { obras, isLoading: obrasLoading } = useObras();
  const { despesas, isLoading: despesasLoading } = useDespesas();
  
  // Query para orçamentos IA
  const { data: orcamentosIA, isLoading: orcamentosLoading } = useQuery({
    queryKey: ['orcamentos-parametricos-analise'],
    queryFn: () => orcamentosParametricosApi.getAll({ limit: 100, offset: 0 })
  });

  // ====================================
  // 📊 CÁLCULOS E ANÁLISES
  // ====================================

  const analiseCompleta = useMemo(() => {
    if (!obras || !despesas || !orcamentosIA?.data) return [];

    return obras.map(obra => {
      // Buscar orçamento IA relacionado
      const orcamentoIA = orcamentosIA.data.find(orc => orc.obra_id === obra.id);
      
      // Calcular despesas da obra
      const despesasObra = despesas.filter(d => d.obra_id === obra.id);
      const totalDespesas = despesasObra.reduce((sum, d) => sum + d.custo, 0);
      const despesasPagas = despesasObra.filter(d => d.pago).reduce((sum, d) => sum + d.custo, 0);
      const despesasPendentes = totalDespesas - despesasPagas;
      
      // Calcular disponibilidade orçamentária
      const saldoDisponivel = obra.orcamento - totalDespesas;
      const percentualGasto = obra.orcamento > 0 ? (totalDespesas / obra.orcamento) * 100 : 0;
      const percentualDisponivel = 100 - percentualGasto;
      
      // Calcular desvio em relação ao orçamento IA (se houver)
      const desvioOrcamentoIA = orcamentoIA?.custo_estimado ? 
        ((totalDespesas - orcamentoIA.custo_estimado) / orcamentoIA.custo_estimado) * 100 : 0;
      
      // Calcular eficiência IA (quanto mais próximo do orçamento IA, melhor)
      const eficiencia = orcamentoIA?.custo_estimado ? 
        Math.max(0, 100 - Math.abs(desvioOrcamentoIA)) : 0;
      
      // Determinar status baseado no saldo disponível e situação financeira
      let status: 'otimo' | 'bom' | 'atencao' | 'critico' = 'bom';
      const alertas: string[] = [];
      
      // Status baseado no saldo disponível
      if (saldoDisponivel < 0) {
        status = 'critico';
        alertas.push(`Orçamento estourado em ${formatCurrencyBR(Math.abs(saldoDisponivel))}`);
      } else if (percentualDisponivel < 10) {
        status = 'atencao';
        alertas.push(`Apenas ${percentualDisponivel.toFixed(1)}% do orçamento disponível`);
      } else if (percentualDisponivel > 70) {
        status = 'otimo';
      }
      
      // Alertas adicionais
      if (percentualGasto > 90) {
        alertas.push(`${percentualGasto.toFixed(1)}% do orçamento já utilizado`);
      }
      
      if (despesasPendentes > obra.orcamento * 0.1) {
        alertas.push(`Alto valor em despesas pendentes: ${formatCurrencyBR(despesasPendentes)}`);
      }
      
      if (!orcamentoIA) {
        alertas.push('Obra sem orçamento IA para comparação');
      }

      return {
        obra,
        orcamentoIA,
        despesas: {
          total: totalDespesas,
          pagas: despesasPagas,
          pendentes: despesasPendentes,
          quantidade: despesasObra.length
        },
        analise: {
          saldoDisponivel,
          percentualGasto,
          percentualDisponivel,
          desvioOrcamentoIA,
          eficiencia,
          status,
          alertas
        }
      } as AnaliseObra;
    });
  }, [obras, despesas, orcamentosIA]);

  // Métricas gerais
  // Cálculos consolidados
  const dadosConsolidados = useMemo(() => {
    if (!analiseCompleta.length) return {
      totalObras: 0,
      obrasComOrcamentoIA: 0,
      totalInvestido: 0,
      totalExecutado: 0,
      totalOrcamentoIA: 0,
      eficienciaMedia: 0,
      obrasComProblemas: 0
    };

    const totalObras = analiseCompleta.length;
    const obrasComOrcamentoIA = analiseCompleta.filter(a => a.orcamentoIA).length;
    const totalInvestido = analiseCompleta.reduce((sum, a) => sum + a.obra.orcamento, 0);
    const totalExecutado = analiseCompleta.reduce((sum, a) => sum + a.despesas.total, 0);
    const totalOrcamentoIA = analiseCompleta
      .filter(a => a.orcamentoIA)
      .reduce((sum, a) => sum + (a.orcamentoIA?.custo_estimado || 0), 0);
    
    const eficienciaMedia = analiseCompleta
      .filter(a => a.orcamentoIA)
      .reduce((sum, a) => sum + a.analise.eficiencia, 0) / obrasComOrcamentoIA || 0;
    
    const obrasComProblemas = analiseCompleta.filter(a => 
      a.analise.status === 'critico' || a.analise.status === 'atencao'
    ).length;

    return {
      totalObras,
      obrasComOrcamentoIA,
      totalInvestido,
      totalExecutado,
      totalOrcamentoIA,
      eficienciaMedia,
      obrasComProblemas
    };
  }, [analiseCompleta]);

  const metricasGerais = useMemo((): MetricaGeral[] => {
    if (!analiseCompleta.length) return [];

    const {
      totalObras,
      obrasComOrcamentoIA,
      totalInvestido,
      totalExecutado: totalGasto,
      totalOrcamentoIA,
      eficienciaMedia,
      obrasComProblemas
    } = dadosConsolidados;

    return [
      {
        titulo: "Total Investido",
        valor: formatCurrencyBR(totalInvestido),
        icone: DollarSign,
        cor: "bg-blue-500",
        descricao: `${totalObras} obras ativas`
      },
      {
        titulo: "Total Executado",
        valor: formatCurrencyBR(totalGasto),
        variacao: totalInvestido > 0 ? ((totalGasto - totalInvestido) / totalInvestido) * 100 : 0,
        icone: TrendingUp,
        cor: "bg-green-500",
        descricao: `${((totalGasto / totalInvestido) * 100).toFixed(1)}% do orçamento`
      },
      {
        titulo: "Orçamento IA",
        valor: formatCurrencyBR(totalOrcamentoIA),
        icone: Calculator,
        cor: "bg-purple-500",
        descricao: `${obrasComOrcamentoIA}/${totalObras} obras com IA`
      },
      {
        titulo: "Eficiência Média",
        valor: `${eficienciaMedia.toFixed(1)}%`,
        icone: Target,
        cor: eficienciaMedia > 80 ? "bg-green-500" : eficienciaMedia > 60 ? "bg-yellow-500" : "bg-red-500",
        descricao: "Precisão vs Orçamento IA"
      },
      {
        titulo: "Obras com Alertas",
        valor: obrasComProblemas.toString(),
        icone: AlertTriangle,
        cor: obrasComProblemas > 0 ? "bg-red-500" : "bg-green-500",
        descricao: `${((obrasComProblemas / totalObras) * 100).toFixed(1)}% do total`
      }
    ];
  }, [analiseCompleta]);

  // Estados de loading
  const isLoading = obrasLoading || despesasLoading || orcamentosLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando análise integrada...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Análise Integrada
              </h1>
              <p className="text-muted-foreground">
                Visão unificada de Obras, Orçamentos IA e Despesas
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard/orcamentos/novo')}
            className={cn(
              "flex items-center gap-2",
              "bg-gradient-to-r from-primary to-primary-focus",
              "hover:from-primary-focus hover:to-primary-focus/90",
              "text-primary-content shadow-lg",
              "transition-all duration-300"
            )}
          >
            <Zap className="h-4 w-4" />
            Novo Orçamento IA
          </Button>
        </motion.div>

        {/* Métricas Gerais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {metricasGerais.map((metrica, index) => (
            <Card 
              key={metrica.titulo} 
              className={cn(
                "relative overflow-hidden",
                "bg-gradient-to-br dark:from-slate-900/70 dark:to-slate-800/70 border",
                metrica.cor === 'bg-blue-500' ? 'from-blue-50 to-blue-100 dark:border-blue-700/50 border-blue-200/80' :
                metrica.cor === 'bg-green-500' ? 'from-green-50 to-green-100 dark:border-green-700/50 border-green-200/80' :
                metrica.cor === 'bg-purple-500' ? 'from-purple-50 to-purple-100 dark:border-purple-700/50 border-purple-200/80' :
                metrica.cor === 'bg-yellow-500' ? 'from-yellow-50 to-yellow-100 dark:border-yellow-700/50 border-yellow-200/80' :
                metrica.cor === 'bg-red-500' ? 'from-red-50 to-red-100 dark:border-red-700/50 border-red-200/80' :
                'from-slate-50 to-slate-100 dark:border-slate-700/50 border-slate-200/80'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metrica.titulo}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${metrica.cor}`}>
                    <metrica.icone className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl md:text-2xl font-bold break-words">{metrica.valor}</span>
                    {metrica.variacao !== undefined && (
                      <Badge 
                        variant={metrica.variacao >= 0 ? "default" : "destructive"}
                        className="text-xs whitespace-nowrap"
                      >
                        {metrica.variacao >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(metrica.variacao).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{metrica.descricao}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs de Análise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
              <TabsTrigger value="alertas">Alertas</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-4">
              {/* Layout responsivo: Cards + Gráficos */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Container dos Cards */}
                <div className="space-y-4 h-[500px] overflow-y-auto">
                  <h3 className="text-lg font-semibold">Obras Individuais</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {analiseCompleta.map((analise, index) => (
                      <motion.div
                        key={analise.obra.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{analise.obra.nome}</CardTitle>
                              <Badge 
                                variant={
                                  analise.analise.status === 'otimo' ? 'default' :
                                  analise.analise.status === 'bom' ? 'secondary' :
                                  analise.analise.status === 'atencao' ? 'outline' : 'destructive'
                                }
                              >
                                {analise.analise.status === 'otimo' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {analise.analise.status === 'critico' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {analise.analise.status.charAt(0).toUpperCase() + analise.analise.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {analise.obra.cidade}, {analise.obra.estado}
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Orçamentos */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Orçamento Original:</span>
                                <span className="font-medium">{formatCurrencyBR(analise.obra.orcamento)}</span>
                              </div>
                              {analise.orcamentoIA && (
                                <div className="flex justify-between text-sm">
                                  <span>Orçamento IA:</span>
                                  <span className="font-medium">{formatCurrencyBR(analise.orcamentoIA.custo_estimado)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span>Total Executado:</span>
                                <span className="font-medium">{formatCurrencyBR(analise.despesas.total)}</span>
                              </div>
                            </div>

                            {/* Progresso e Saldo */}
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Progresso Orçamentário</span>
                                <span>{analise.analise.percentualGasto.toFixed(1)}%</span>
                              </div>
                              <Progress 
                                value={Math.min(analise.analise.percentualGasto, 100)}
                                className="h-2"
                              />
                              
                              <div className="flex justify-between text-sm">
                                <span className={analise.analise.saldoDisponivel >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {analise.analise.saldoDisponivel >= 0 ? 'Saldo Disponível:' : 'Orçamento Estourado:'}
                                </span>
                                <span className={`font-medium ${analise.analise.saldoDisponivel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrencyBR(Math.abs(analise.analise.saldoDisponivel))}
                                </span>
                              </div>
                            </div>

                            {/* Eficiência IA */}
                            {analise.orcamentoIA && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Eficiência IA</span>
                                  <span>{analise.analise.eficiencia.toFixed(1)}%</span>
                                </div>
                                <Progress 
                                  value={analise.analise.eficiencia}
                                  className="h-2"
                                />
                              </div>
                            )}

                            {/* Ações */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/dashboard/obras/${analise.obra.id}`)}
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Obra
                              </Button>
                              {analise.orcamentoIA && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/orcamentos/${analise.orcamentoIA!.id}`)}
                                  className="flex-1"
                                >
                                  <Calculator className="h-4 w-4 mr-1" />
                                  Ver Orçamento
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Container dos Gráficos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Análise Visual</h3>
                  
                  {/* Gráfico de Barras Comparativo */}
                  <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                        Comparativo Orçamentário
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Análise visual dos investimentos por obra
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          original: {
                            label: "Orçamento Original",
                            color: "#3b82f6", // Azul suave
                          },
                          ia: {
                            label: "Orçamento IA",
                            color: "#8b5cf6", // Roxo suave
                          },
                          executado: {
                            label: "Total Executado",
                            color: "#10b981", // Verde suave
                          },
                        }}
                        className="h-[280px] w-full"
                      >
                        <BarChart
                          data={analiseCompleta.map(analise => ({
                            obra: analise.obra.nome.length > 20 
                              ? analise.obra.nome.substring(0, 20) + '...' 
                              : analise.obra.nome,
                            nomeCompleto: analise.obra.nome,
                            original: analise.obra.orcamento,
                            ia: analise.orcamentoIA?.custo_estimado || 0,
                            executado: analise.despesas.total,
                          }))}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 40,
                            bottom: 40,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis 
                            dataKey="obra" 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            angle={0}
                            textAnchor="middle"
                            height={60}
                            interval={0}
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(value) => 
                              new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                notation: 'compact',
                                maximumFractionDigits: 0
                              }).format(value)
                            }
                          />
                          <ChartTooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                      {data.nomeCompleto}
                                    </p>
                                    {payload.map((entry, index) => (
                                      <div key={index} className="flex items-center justify-between gap-4 mb-1">
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: entry.color }}
                                          ></div>
                                          <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {entry.dataKey === 'original' ? 'Orçamento Original' :
                                             entry.dataKey === 'ia' ? 'Orçamento IA' : 'Total Executado'}
                                          </span>
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                          {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                          }).format(entry.value as number)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="original" 
                            fill="#3b82f6" 
                            name="Orçamento Original"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="ia" 
                            fill="#8b5cf6" 
                            name="Orçamento IA"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="executado" 
                            fill="#10b981" 
                            name="Total Executado"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>


                </div>
              </div>
            </TabsContent>

            {/* Comparativo */}
            <TabsContent value="comparativo" className="space-y-4">
              <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Análise Comparativa</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Comparação entre orçamentos originais, IA e execução real
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analiseCompleta
                      .filter(a => a.orcamentoIA)
                      .map((analise) => (
                        <div key={analise.obra.id} className="border rounded-lg p-4 space-y-3">
                          <h4 className="font-medium">{analise.obra.nome}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <p className="text-blue-600 font-medium">Orçamento Original</p>
                              <p className="text-base md:text-lg font-bold text-blue-800 break-words">
                                {formatCurrencyBR(analise.obra.orcamento)}
                              </p>
                            </div>
                            
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <p className="text-purple-600 font-medium">Orçamento IA</p>
                              <p className="text-base md:text-lg font-bold text-purple-800 break-words">
                                {formatCurrencyBR(analise.orcamentoIA!.custo_estimado)}
                              </p>
                              <p className="text-xs text-purple-600">
                                {analise.analise.desvioOrcamentoIA > 0 ? '+' : ''}
                                {analise.analise.desvioOrcamentoIA.toFixed(1)}% vs real
                              </p>
                            </div>
                            
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <p className="text-green-600 font-medium">Executado</p>
                              <p className="text-base md:text-lg font-bold text-green-800 break-words">
                                {formatCurrencyBR(analise.despesas.total)}
                              </p>
                              <p className="text-xs text-green-600">
                                {analise.analise.desvioOrcamentoIA > 0 ? '+' : ''}
                                {analise.analise.desvioOrcamentoIA.toFixed(1)}% vs IA
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alertas */}
            <TabsContent value="alertas" className="space-y-4">
              <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Alertas e Pontos de Atenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analiseCompleta
                      .filter(a => a.analise.alertas.length > 0)
                      .map((analise) => (
                        <Alert key={analise.obra.id} className={
                          analise.analise.status === 'critico' ? 'border-red-200 bg-red-50' :
                          analise.analise.status === 'atencao' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-medium">{analise.obra.nome}</p>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {analise.analise.alertas.map((alerta, index) => (
                                  <li key={index}>{alerta}</li>
                                ))}
                              </ul>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/obras/${analise.obra.id}`)}
                                >
                                  Ver Detalhes
                                </Button>
                                {!analise.orcamentoIA && (
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/dashboard/orcamentos/novo?obra_id=${analise.obra.id}`)}
                                  >
                                    Criar Orçamento IA
                                  </Button>
                                )}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))
                    }
                    
                    {analiseCompleta.filter(a => a.analise.alertas.length > 0).length === 0 && (
                      <Card>
                        <CardContent className="flex items-center justify-center py-8">
                          <div className="text-center space-y-2">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                            <h3 className="text-lg font-medium">Tudo em ordem!</h3>
                            <p className="text-muted-foreground">
                              Não há alertas críticos no momento.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AnaliseIntegrada;