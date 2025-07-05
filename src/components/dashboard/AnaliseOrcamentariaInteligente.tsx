/**
 * 💰 Componente de Análise Orçamentária Inteligente
 * 
 * Diferencia claramente:
 * - Orçamento Disponível (dinheiro investido/disponível para a obra)
 * - Orçamento Paramétrico (estimativa de gastos baseada em IA/SINAPI)
 * 
 * Fornece análises comparativas, projeções e controle inteligente de gastos.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    BarChart3,
    Calculator,
    CheckCircle,
    Eye,
    PiggyBank,
    Target,
    TrendingUp,
    Wallet,
    Zap
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import SelecionarObraModal from "@/components/orcamento/SelecionarObraModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDespesas } from "@/hooks/useDespesas";
import { useObras } from "@/hooks/useObras";
import { formatCurrencyBR } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { orcamentosParametricosApi } from "@/services/orcamentoApi";
import { ComparativoEstimativas } from "./ComparativoEstimativas";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface AnaliseOrcamentariaObra {
  obra: {
    id: string;
    nome: string;
    orcamento: number; // Orçamento Disponível (dinheiro investido)
    cidade: string;
    estado: string;
    data_inicio?: string;
    data_prevista_termino?: string;
  };
  orcamentoParametrico?: {
    id: string;
    nome_orcamento: string;
    custo_estimado: number; // Orçamento Paramétrico (estimativa de gastos)
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
    total: number; // Total já gasto
    pagas: number;
    pendentes: number;
    quantidade: number;
  };
  controleOrcamentario: {
    // Análise do Orçamento Disponível (Dinheiro Investido)
    saldoDisponivel: number; // Quanto ainda tem para gastar
    percentualConsumido: number; // % do orçamento disponível já gasto
    percentualRestante: number; // % do orçamento disponível ainda disponível
    
    // Análise do Orçamento Paramétrico (Estimativa de Gastos)
    desvioEstimativa: number; // Diferença entre gasto real e estimativa
    precisaoEstimativa: number; // Quão precisa foi a estimativa
    
    // Projeções e Controle
    projecaoGastoFinal: number; // Projeção do gasto total da obra
    riscoPorcentual: 'baixo' | 'medio' | 'alto' | 'critico';
    statusFinanceiro: 'saudavel' | 'atencao' | 'risco' | 'critico';
    alertas: string[];
    recomendacoes: string[];
  };
}

interface MetricaOrcamentaria {
  titulo: string;
  valor: string;
  subtitulo: string;
  variacao?: number;
  icone: React.ElementType;
  cor: string;
  descricao: string;
  tooltip: string;
}

// ====================================
// 🎯 COMPONENTE PRINCIPAL
// ====================================

interface AnaliseOrcamentariaInteligenteProps {
  className?: string;
}

export const AnaliseOrcamentariaInteligente: React.FC<AnaliseOrcamentariaInteligenteProps> = ({ 
  className 
}) => {
  const navigate = useNavigate();
  const [tabAtiva, setTabAtiva] = useState("controle-financeiro");
  const [showSelecionarObraModal, setShowSelecionarObraModal] = useState(false);
  
  // Hooks para dados
  const { obras, isLoading: obrasLoading } = useObras();
  const { despesas, isLoading: despesasLoading } = useDespesas();
  
  // Query para orçamentos paramétricos
  const { data: orcamentosParametricos, isLoading: orcamentosLoading } = useQuery({
    queryKey: ['orcamentos-parametricos-controle'],
    queryFn: () => orcamentosParametricosApi.getAll({ limit: 100, offset: 0 })
  });

  // ====================================
  // 📊 CÁLCULOS E ANÁLISES INTELIGENTES
  // ====================================

  const analiseOrcamentaria = useMemo(() => {
    if (!obras || !despesas || !orcamentosParametricos?.data) return [];

    return obras.map(obra => {
      // Buscar orçamento paramétrico relacionado
      const orcamentoParametrico = orcamentosParametricos.data.find(orc => orc.obra_id === obra.id);
      
      // Calcular despesas da obra
      const despesasObra = despesas.filter(d => d.obra_id === obra.id);
      const totalGasto = despesasObra.reduce((sum, d) => sum + d.custo, 0);
      const despesasPagas = despesasObra.filter(d => d.pago).reduce((sum, d) => sum + d.custo, 0);
      const despesasPendentes = totalGasto - despesasPagas;
      
      // Custo operacional para projeção (ignora custos pontuais como aquisição)
      const totalGastoOperacional = despesasObra
        .filter(d => d.categoria !== 'AQUISICAO_TERRENO_AREA')
        .reduce((sum, d) => sum + d.custo, 0);
      
      // ===== ANÁLISE DO ORÇAMENTO DISPONÍVEL (Dinheiro Investido) =====
      const saldoDisponivel = obra.orcamento - totalGasto;
      const percentualConsumido = obra.orcamento > 0 ? (totalGasto / obra.orcamento) * 100 : 0;
      const percentualRestante = 100 - percentualConsumido;
      
      // ===== ANÁLISE DO ORÇAMENTO PARAMÉTRICO (Estimativa de Gastos) =====
      const desvioEstimativa = orcamentoParametrico?.custo_estimado ? 
        ((totalGastoOperacional - orcamentoParametrico.custo_estimado) / orcamentoParametrico.custo_estimado) * 100 : 0;
      
      const precisaoEstimativa = orcamentoParametrico?.custo_estimado ? 
        Math.max(0, 100 - Math.abs(desvioEstimativa)) : 0;
      
      // ===== PROJEÇÕES E CONTROLE INTELIGENTE =====
      
      // Projeção baseada na tendência atual de gastos
      const diasDecorridos = obra.data_inicio ? 
        Math.max(1, Math.floor((new Date().getTime() - new Date(obra.data_inicio).getTime()) / (1000 * 60 * 60 * 24))) : 1;
      
      const diasTotais = obra.data_inicio && obra.data_prevista_termino ? 
        Math.max(1, Math.floor((new Date(obra.data_prevista_termino).getTime() - new Date(obra.data_inicio).getTime()) / (1000 * 60 * 60 * 24))) : 365;
      
      const progressoTemporal = Math.min(100, (diasDecorridos / diasTotais) * 100);
      const velocidadeGasto = diasDecorridos > 0 ? totalGastoOperacional / diasDecorridos : 0;
      const projecaoGastoFinal = velocidadeGasto * diasTotais;
      
      // Determinar risco e status
      let riscoPorcentual: 'baixo' | 'medio' | 'alto' | 'critico' = 'baixo';
      let statusFinanceiro: 'saudavel' | 'atencao' | 'risco' | 'critico' = 'saudavel';
      
      if (saldoDisponivel < 0) {
        riscoPorcentual = 'critico';
        statusFinanceiro = 'critico';
      } else if (percentualConsumido > 90) {
        riscoPorcentual = 'alto';
        statusFinanceiro = 'risco';
      } else if (percentualConsumido > 75) {
        riscoPorcentual = 'medio';
        statusFinanceiro = 'atencao';
      }
      
      // Se a projeção indica estouro
      if (projecaoGastoFinal > obra.orcamento * 1.1) {
        riscoPorcentual = riscoPorcentual === 'baixo' ? 'medio' : 'alto';
        statusFinanceiro = statusFinanceiro === 'saudavel' ? 'atencao' : statusFinanceiro;
      }
      
      // Gerar alertas e recomendações inteligentes
      const alertas: string[] = [];
      const recomendacoes: string[] = [];
      
      // Alertas críticos
      if (saldoDisponivel < 0) {
        alertas.push(`⚠️ Orçamento estourado em ${formatCurrencyBR(Math.abs(saldoDisponivel))}`);
        recomendacoes.push("Revisar escopo da obra ou solicitar aporte adicional");
      }
      
      if (percentualConsumido > 90) {
        alertas.push(`🚨 ${percentualConsumido.toFixed(1)}% do orçamento disponível já consumido`);
        recomendacoes.push("Controlar rigorosamente os próximos gastos");
      }
      
      if (projecaoGastoFinal > obra.orcamento) {
        alertas.push(`📈 Projeção indica possível estouro de ${formatCurrencyBR(projecaoGastoFinal - obra.orcamento)}`);
        recomendacoes.push("Revisar cronograma e otimizar custos restantes");
      }
      
      // Alertas sobre estimativa
      if (!orcamentoParametrico) {
        alertas.push("📊 Obra sem orçamento paramétrico para comparação");
        recomendacoes.push("Criar orçamento paramétrico para melhor controle");
      } else {
        // Apenas mostra alerta de desvio se um mínimo de gastos operacionais já ocorreu
        const limiteMinimoGasto = orcamentoParametrico.custo_estimado * 0.05; // 5%
        if (Math.abs(desvioEstimativa) > 20 && totalGastoOperacional > limiteMinimoGasto) {
          alertas.push(`📊 Grande desvio da estimativa: ${desvioEstimativa > 0 ? '+' : ''}${desvioEstimativa.toFixed(1)}%`);
          recomendacoes.push("Revisar metodologia de estimativa para próximas obras");
        }
      }
      
      // Alertas sobre despesas pendentes
      if (despesasPendentes > obra.orcamento * 0.15) {
        alertas.push(`💳 Alto valor em despesas pendentes: ${formatCurrencyBR(despesasPendentes)}`);
        recomendacoes.push("Priorizar quitação de despesas pendentes");
      }
      
      // Recomendações positivas
      if (statusFinanceiro === 'saudavel' && precisaoEstimativa > 80) {
        recomendacoes.push("✅ Obra com controle financeiro exemplar");
      }
      
      if (percentualConsumido < progressoTemporal - 10) {
        recomendacoes.push("💰 Obra abaixo do orçamento previsto - boa gestão!");
      }

      return {
        obra,
        orcamentoParametrico,
        despesas: {
          total: totalGasto,
          pagas: despesasPagas,
          pendentes: despesasPendentes,
          quantidade: despesasObra.length
        },
        controleOrcamentario: {
          saldoDisponivel,
          percentualConsumido,
          percentualRestante,
          desvioEstimativa,
          precisaoEstimativa,
          projecaoGastoFinal,
          riscoPorcentual,
          statusFinanceiro,
          alertas,
          recomendacoes
        }
      } as AnaliseOrcamentariaObra;
    });
  }, [obras, despesas, orcamentosParametricos]);

  // Métricas consolidadas
  const metricasConsolidadas = useMemo(() => {
    if (!analiseOrcamentaria.length) return {
      totalObras: 0,
      totalInvestido: 0,
      totalGasto: 0,
      totalEstimado: 0,
      saldoTotalDisponivel: 0,
      obrasComRisco: 0,
      precisaoMediaEstimativas: 0
    };

    const totalObras = analiseOrcamentaria.length;
    const totalInvestido = analiseOrcamentaria.reduce((sum, a) => sum + a.obra.orcamento, 0);
    const totalGasto = analiseOrcamentaria.reduce((sum, a) => sum + a.despesas.total, 0);
    const totalEstimado = analiseOrcamentaria
      .filter(a => a.orcamentoParametrico)
      .reduce((sum, a) => sum + (a.orcamentoParametrico?.custo_estimado || 0), 0);
    
    const saldoTotalDisponivel = totalInvestido - totalGasto;
    const obrasComRisco = analiseOrcamentaria.filter(a => 
      a.controleOrcamentario.statusFinanceiro === 'risco' || 
      a.controleOrcamentario.statusFinanceiro === 'critico'
    ).length;
    
    const obrasComEstimativa = analiseOrcamentaria.filter(a => a.orcamentoParametrico);
    const precisaoMediaEstimativas = obrasComEstimativa.length > 0 ?
      obrasComEstimativa.reduce((sum, a) => sum + a.controleOrcamentario.precisaoEstimativa, 0) / obrasComEstimativa.length : 0;

    return {
      totalObras,
      totalInvestido,
      totalGasto,
      totalEstimado,
      saldoTotalDisponivel,
      obrasComRisco,
      precisaoMediaEstimativas
    };
  }, [analiseOrcamentaria]);

  const metricasOrcamentarias = useMemo((): MetricaOrcamentaria[] => {
    const {
      totalObras,
      totalInvestido,
      totalGasto,
      totalEstimado,
      saldoTotalDisponivel,
      obrasComRisco,
      precisaoMediaEstimativas
    } = metricasConsolidadas;

    return [
      {
        titulo: "Orçamento Disponível",
        valor: formatCurrencyBR(totalInvestido),
        subtitulo: "Dinheiro Investido",
        icone: Wallet,
        cor: "bg-blue-500",
        descricao: `${totalObras} obras ativas`,
        tooltip: "Total de dinheiro disponível/investido para todas as obras"
      },
      {
        titulo: "Total Executado",
        valor: formatCurrencyBR(totalGasto),
        subtitulo: "Já Gasto",
        variacao: totalInvestido > 0 ? ((totalGasto / totalInvestido) * 100) - 100 : 0,
        icone: TrendingUp,
        cor: totalGasto > totalInvestido ? "bg-red-500" : "bg-green-500",
        descricao: `${((totalGasto / totalInvestido) * 100).toFixed(1)}% do disponível`,
        tooltip: "Total já gasto em todas as obras"
      },
      {
        titulo: "Saldo Disponível",
        valor: formatCurrencyBR(saldoTotalDisponivel),
        subtitulo: "Restante",
        icone: PiggyBank,
        cor: saldoTotalDisponivel < 0 ? "bg-red-500" : "bg-green-500",
        descricao: saldoTotalDisponivel < 0 ? "Orçamento estourado" : "Disponível para gastar",
        tooltip: "Quanto ainda resta do orçamento disponível"
      },
      {
        titulo: "Estimativa Paramétrica",
        valor: formatCurrencyBR(totalEstimado),
        subtitulo: "Custo Estimado",
        icone: Calculator,
        cor: "bg-purple-500",
        descricao: "Baseado em IA/SINAPI",
        tooltip: "Estimativa de custo total baseada em orçamentos paramétricos"
      },
      {
        titulo: "Precisão Estimativas",
        valor: `${precisaoMediaEstimativas.toFixed(1)}%`,
        subtitulo: "Acurácia IA",
        icone: Target,
        cor: precisaoMediaEstimativas > 80 ? "bg-green-500" : precisaoMediaEstimativas > 60 ? "bg-yellow-500" : "bg-red-500",
        descricao: "Precisão das estimativas",
        tooltip: "Quão precisas têm sido as estimativas paramétricas"
      },
      {
        titulo: "Obras em Risco",
        valor: obrasComRisco.toString(),
        subtitulo: "Atenção",
        icone: AlertTriangle,
        cor: obrasComRisco > 0 ? "bg-red-500" : "bg-green-500",
        descricao: `${((obrasComRisco / totalObras) * 100).toFixed(1)}% do total`,
        tooltip: "Obras com risco financeiro ou orçamento crítico"
      }
    ];
  }, [metricasConsolidadas]);

  // Estados de loading
  const isLoading = obrasLoading || despesasLoading || orcamentosLoading;

  const obraAnalisada = analiseOrcamentaria[0];

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando análise orçamentária...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Controle Orçamentário Inteligente
              </h1>
              <p className="text-muted-foreground">
                Diferenciação clara entre orçamento disponível e estimativas paramétricas
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowSelecionarObraModal(true)}
            className={cn(
              "flex items-center gap-2",
              "bg-gradient-to-r from-primary to-primary-focus",
              "hover:from-primary-focus hover:to-primary-focus/90",
              "text-primary-content shadow-lg",
              "transition-all duration-300"
            )}
          >
            <Zap className="h-4 w-4" />
            Novo Orçamento Paramétrico
          </Button>
        </motion.div>

        {/* Métricas Orçamentárias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {metricasOrcamentarias.map((metrica, index) => (
            <Tooltip key={metrica.titulo}>
              <TooltipTrigger asChild>
                <Card 
                  className={cn(
                    "relative overflow-hidden cursor-help",
                    "bg-gradient-to-br dark:from-slate-900/70 dark:to-slate-800/70 border",
                    "hover:shadow-lg transition-all duration-300",
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
                      <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {metrica.titulo}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground/80">
                          {metrica.subtitulo}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${metrica.cor}`}>
                        <metrica.icone className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg md:text-xl font-bold break-words">{metrica.valor}</span>
                        {metrica.variacao !== undefined && (
                          <Badge 
                            variant={metrica.variacao >= 0 ? "default" : "destructive"}
                            className="text-xs whitespace-nowrap"
                          >
                            {metrica.variacao >= 0 ? '+' : ''}{metrica.variacao.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground break-words">
                        {metrica.descricao}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{metrica.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </motion.div>

        {/* Tabs de Análise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="controle-financeiro">Controle Financeiro</TabsTrigger>
              <TabsTrigger value="comparativo-estimativas">Comparativo</TabsTrigger>
              <TabsTrigger value="projecoes">Projeções</TabsTrigger>
              <TabsTrigger value="alertas-recomendacoes">Alertas</TabsTrigger>
            </TabsList>

            {/* Controle Financeiro */}
            <TabsContent value="controle-financeiro" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cards de Obras */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Controle por Obra
                  </h3>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {analiseOrcamentaria.map((analise) => (
                      <motion.div
                        key={analise.obra.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Card className={cn(
                          "relative overflow-hidden",
                          "bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95",
                          "border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm",
                          analise.controleOrcamentario.statusFinanceiro === 'critico' ? 'border-red-500/50' :
                          analise.controleOrcamentario.statusFinanceiro === 'risco' ? 'border-orange-500/50' :
                          analise.controleOrcamentario.statusFinanceiro === 'atencao' ? 'border-yellow-500/50' :
                          'border-green-500/50'
                        )}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">{analise.obra.nome}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {analise.obra.cidade}, {analise.obra.estado}
                                </p>
                              </div>
                              <Badge 
                                variant={analise.controleOrcamentario.statusFinanceiro === 'saudavel' ? 'default' : 'destructive'}
                                className={cn(
                                  "text-xs",
                                  analise.controleOrcamentario.statusFinanceiro === 'saudavel' ? 'bg-green-500' :
                                  analise.controleOrcamentario.statusFinanceiro === 'atencao' ? 'bg-yellow-500' :
                                  analise.controleOrcamentario.statusFinanceiro === 'risco' ? 'bg-orange-500' :
                                  'bg-red-500'
                                )}
                              >
                                {analise.controleOrcamentario.statusFinanceiro === 'saudavel' ? '✅ Saudável' :
                                 analise.controleOrcamentario.statusFinanceiro === 'atencao' ? '⚠️ Atenção' :
                                 analise.controleOrcamentario.statusFinanceiro === 'risco' ? '🚨 Risco' :
                                 '🔴 Crítico'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Orçamento Disponível vs Gasto */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-1">
                                  <Wallet className="h-4 w-4 text-blue-500" />
                                  Orçamento Disponível
                                </span>
                                <span className="font-medium">{formatCurrencyBR(analise.obra.orcamento)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                  Total Executado
                                </span>
                                <span className="font-medium">{formatCurrencyBR(analise.despesas.total)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold">
                                <span className="flex items-center gap-1">
                                  <PiggyBank className="h-4 w-4 text-purple-500" />
                                  Saldo Disponível
                                </span>
                                <span className={cn(
                                  "font-bold",
                                  analise.controleOrcamentario.saldoDisponivel < 0 ? 'text-red-600' : 'text-green-600'
                                )}>
                                  {formatCurrencyBR(analise.controleOrcamentario.saldoDisponivel)}
                                </span>
                              </div>
                            </div>

                            {/* Progresso Orçamentário */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progresso Orçamentário</span>
                                <span className="font-medium">
                                  {analise.controleOrcamentario.percentualConsumido.toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(100, analise.controleOrcamentario.percentualConsumido)} 
                                className={cn(
                                  "h-2",
                                  analise.controleOrcamentario.percentualConsumido > 100 ? "bg-red-100" :
                                  analise.controleOrcamentario.percentualConsumido > 90 ? "bg-orange-100" :
                                  "bg-green-100"
                                )}
                              />
                            </div>

                            {/* Comparação com Estimativa Paramétrica */}
                            {analise.orcamentoParametrico && (
                              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between text-sm">
                                  <span className="flex items-center gap-1">
                                    <Calculator className="h-4 w-4 text-purple-500" />
                                    Estimativa Paramétrica
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrencyBR(analise.orcamentoParametrico.custo_estimado)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Desvio da Estimativa</span>
                                  <Badge 
                                    variant={Math.abs(analise.controleOrcamentario.desvioEstimativa) < 10 ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {analise.controleOrcamentario.desvioEstimativa > 0 ? '+' : ''}
                                    {analise.controleOrcamentario.desvioEstimativa.toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Precisão da Estimativa</span>
                                  <span className={cn(
                                    "font-medium",
                                    analise.controleOrcamentario.precisaoEstimativa > 80 ? 'text-green-600' :
                                    analise.controleOrcamentario.precisaoEstimativa > 60 ? 'text-yellow-600' :
                                    'text-red-600'
                                  )}>
                                    {analise.controleOrcamentario.precisaoEstimativa.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Botões de Ação */}
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
                              {analise.orcamentoParametrico && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/orcamentos/${analise.orcamentoParametrico!.id}`)}
                                  className="flex-1"
                                >
                                  <Calculator className="h-4 w-4 mr-1" />
                                  Ver Estimativa
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Gráfico de Controle Orçamentário */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Visão Geral Orçamentária
                  </h3>
                  
                  <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                        Controle Orçamentário por Obra
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Comparação entre orçamento disponível, gasto e estimativas
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          disponivel: {
                            label: "Orçamento Disponível",
                            color: "#3b82f6", // Azul
                          },
                          gasto: {
                            label: "Total Gasto",
                            color: "#10b981", // Verde
                          },
                          estimativa: {
                            label: "Estimativa Paramétrica",
                            color: "#8b5cf6", // Roxo
                          },
                        }}
                        className="h-[350px] w-full"
                      >
                        <BarChart
                          data={analiseOrcamentaria.map(analise => ({
                            obra: analise.obra.nome.length > 15 
                              ? analise.obra.nome.substring(0, 15) + '...' 
                              : analise.obra.nome,
                            nomeCompleto: analise.obra.nome,
                            disponivel: analise.obra.orcamento,
                            gasto: analise.despesas.total,
                            estimativa: analise.orcamentoParametrico?.custo_estimado || 0,
                            status: analise.controleOrcamentario.statusFinanceiro
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
                            angle={-45}
                            textAnchor="end"
                            height={80}
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
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                          <span className="text-sm text-slate-600 dark:text-slate-300">
                                            Orçamento Disponível
                                          </span>
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                          {formatCurrencyBR(data.disponivel)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                          <span className="text-sm text-slate-600 dark:text-slate-300">
                                            Total Gasto
                                          </span>
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                          {formatCurrencyBR(data.gasto)}
                                        </span>
                                      </div>
                                      {data.estimativa > 0 && (
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                              Estimativa Paramétrica
                                            </span>
                                          </div>
                                          <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {formatCurrencyBR(data.estimativa)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                                        <div className="flex items-center justify-between gap-4">
                                          <span className="text-sm text-slate-600 dark:text-slate-300">
                                            Status Financeiro
                                          </span>
                                          <Badge 
                                            variant={data.status === 'saudavel' ? 'default' : 'destructive'}
                                            className={cn(
                                              "text-xs",
                                              data.status === 'saudavel' ? 'bg-green-500' :
                                              data.status === 'atencao' ? 'bg-yellow-500' :
                                              data.status === 'risco' ? 'bg-orange-500' :
                                              'bg-red-500'
                                            )}
                                          >
                                            {data.status === 'saudavel' ? 'Saudável' :
                                             data.status === 'atencao' ? 'Atenção' :
                                             data.status === 'risco' ? 'Risco' :
                                             'Crítico'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="disponivel" 
                            fill="#3b82f6" 
                            name="Orçamento Disponível"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="gasto" 
                            fill="#10b981" 
                            name="Total Gasto"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="estimativa" 
                            fill="#8b5cf6" 
                            name="Estimativa Paramétrica"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Outras tabs serão implementadas em seguida... */}
            <TabsContent value="comparativo-estimativas" className="space-y-4">
              <ComparativoEstimativas orcamentoId={obraAnalisada?.orcamentoParametrico?.id} />
            </TabsContent>

            <TabsContent value="projecoes" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Projeções em desenvolvimento...</p>
              </div>
            </TabsContent>

            <TabsContent value="alertas-recomendacoes" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas e Recomendações
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analiseOrcamentaria.map((analise) => (
                    <Card key={analise.obra.id} className="space-y-4 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base">{analise.obra.nome}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Alertas */}
                        {analise.controleOrcamentario.alertas.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Alertas
                            </h5>
                            {analise.controleOrcamentario.alertas.map((alerta, index) => (
                              <Alert key={index} className="border-red-200/70 bg-red-50/80 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-100">
                                <AlertDescription className="text-sm">
                                  {alerta}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        )}
                        
                        {/* Recomendações */}
                        {analise.controleOrcamentario.recomendacoes.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Recomendações
                            </h5>
                            {analise.controleOrcamentario.recomendacoes.map((recomendacao, index) => (
                              <Alert key={index} className="border-blue-200/70 bg-blue-50/80 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-100">
                                <AlertDescription className="text-sm">
                                  {recomendacao}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Modal de Seleção de Obra para Orçamento */}
        <SelecionarObraModal
          open={showSelecionarObraModal}
          onOpenChange={setShowSelecionarObraModal}
          returnPath="/dashboard/ControleOrcamentario"
          title="Selecionar Obra para Orçamento"
          description="Escolha a obra para criar o orçamento paramétrico com IA"
        />
      </div>
    </TooltipProvider>
  );
};

export default AnaliseOrcamentariaInteligente;