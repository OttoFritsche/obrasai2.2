/**
 * 📋 Página de Detalhes do Orçamento Paramétrico
 * 
 * Interface para visualização completa de um orçamento com
 * todos os detalhes técnicos e análises da IA.
 * 
 * @author ObrasAI Team
 * @version 2.0.0 - Orçamento Paramétrico
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Calculator, 
  MapPin,
  Building,
  Ruler,
  DollarSign,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  RefreshCcw,
  PieChart,
  FileText,
  Layers,
  ArrowRight,
  Building2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import ItensDetalhados from "@/components/orcamento/ItensDetalhados";
import { orcamentosParametricosApi, itensOrcamentoApi, calculoOrcamentoApi, orcamentoUtils } from "@/services/orcamentoApi";
import { useObras } from "@/hooks/useObras";
import type { 
  OrcamentoParametrico,
  ItemOrcamento} from "@/lib/validations/orcamento";
import {
  TIPO_OBRA_LABELS,
  PADRAO_OBRA_LABELS,
  STATUS_ORCAMENTO_LABELS,
  STATUS_ORCAMENTO_CORES
} from "@/lib/validations/orcamento";

// ====================================
// 🏗️ COMPONENTE PRINCIPAL
// ====================================

const OrcamentoDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados locais
  const [recalculando, setRecalculando] = useState(false);
  const [ultimoCalculo, setUltimoCalculo] = useState<{ data: string; valor_total: number } | null>(null);
  const [convertendoDespesas, setConvertendoDespesas] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState<string>("");
  const [mostrarModalConversao, setMostrarModalConversao] = useState(false);

  // Validação do UUID - evita tentar buscar IDs inválidos como 'novo'
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const isValidId = id && isValidUUID(id);

  // Queries
  const { 
    data: orcamento, 
    isLoading: orcamentoLoading, 
    error: orcamentoError,
    refetch: refetchOrcamento
  } = useQuery({
    queryKey: ['orcamento', id],
    queryFn: () => orcamentosParametricosApi.getById(id!),
    enabled: !!isValidId
  });

  const { 
    data: itens = [], 
    isLoading: itensLoading,
    refetch: refetchItens,
    error: itensError
  } = useQuery({
    queryKey: ['itens-orcamento', id],
    queryFn: async () => {
      const result = await itensOrcamentoApi.getByOrcamento(id!);
      return result;
    },
    enabled: !!isValidId
  });

  // Hook para obras (para seleção na conversão)
  const { obras } = useObras();



  // Verificar se o orçamento precisa ser recalculado (não tem itens)
  const precisaRecalcular = orcamento && (!itens || itens.length === 0);

  // ====================================
  // 🎯 HANDLERS DE EVENTOS
  // ====================================

  /**
   * Recalcular orçamento com IA paramétrica
   */
  const handleRecalcular = async () => {
    if (!id) return;

    try {
      setRecalculando(true);
      toast.info("🤖 Recalculando orçamento com IA paramétrica...");

      const resultado = await calculoOrcamentoApi.recalcular(id);
      
      if (resultado.success) {
        setUltimoCalculo(resultado);
        
        // Mostrar informações do cálculo
        const stats = resultado.estatisticas;
        if (stats) {
          toast.success(
            `✨ Orçamento recalculado com sucesso!\n` +
            `💰 ${orcamentoUtils.formatarValor(resultado.orcamento.custo_estimado)}`,
            { duration: 5000 }
          );
        } else {
          toast.success("✨ Orçamento recalculado com sucesso!");
        }
        
        // Atualizar dados
        await Promise.all([
          refetchOrcamento(),
          refetchItens()
        ]);
      }
    } catch (error: Error & { message?: string }) {
      console.error("Erro ao recalcular:", error);
      toast.error(`❌ Erro ao recalcular orçamento: ${error.message}`);
    } finally {
      setRecalculando(false);
    }
  };

  /**
   * Converte orçamento em despesas para uma obra
   */
  const handleConverterParaDespesas = async () => {
    if (!id || !obraSelecionada) {
      toast.error("Selecione uma obra para converter o orçamento");
      return;
    }

    try {
      setConvertendoDespesas(true);
      toast.info("🔄 Convertendo orçamento em despesas...");

      const resultado = await orcamentoUtils.converterParaDespesas(id, obraSelecionada);
      
      if (resultado.success) {
        toast.success(`✅ ${resultado.message}`);
        setMostrarModalConversao(false);
        setObraSelecionada("");
        
        // Navegar para a obra com as despesas criadas
        navigate(`/dashboard/obras/${obraSelecionada}?tab=despesas`);
      } else {
        toast.error(`❌ Erro na conversão: ${resultado.error}`);
      }
    } catch (error) {
      console.error("Erro na conversão:", error);
      toast.error("❌ Erro inesperado na conversão");
    } finally {
      setConvertendoDespesas(false);
    }
  };

  /**
   * Duplicar orçamento
   */
  const handleDuplicar = async () => {
    if (!orcamento) return;

    try {
      const duplicado = await orcamentosParametricosApi.duplicate(
        orcamento.id, 
        `${orcamento.nome_orcamento} (Cópia)`
      );
      toast.success("🎉 Orçamento duplicado com sucesso!");
      navigate(`/dashboard/orcamentos/${duplicado.id}`);
    } catch (error) {
      console.error("Erro ao duplicar:", error);
      toast.error("❌ Erro ao duplicar orçamento");
    }
  };

  // ====================================
  // 🎨 COMPONENTES AUXILIARES
  // ====================================

  /**
   * Badge de status
   */
  const StatusBadge: React.FC<{ status: OrcamentoParametrico['status'] }> = ({ status }) => (
    <Badge className={STATUS_ORCAMENTO_CORES[status]}>
      {STATUS_ORCAMENTO_LABELS[status]}
    </Badge>
  );

  /**
   * Estatísticas do orçamento
   */
  const EstatisticasOrcamento: React.FC<{ orcamento: OrcamentoParametrico }> = ({ orcamento }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Custo Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {orcamentoUtils.formatarValor(orcamento.custo_estimado)}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Valor total estimado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
            Custo por m²
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {orcamentoUtils.formatarValor(orcamento.custo_m2)}
              </div>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                Valor unitário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

                <Card className="bg-gradient-to-br from-[#182b4d]/10 to-[#daa916]/10 dark:from-[#182b4d]/20 dark:to-[#daa916]/20 border-[#182b4d]/30 dark:border-[#daa916]/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-[#182b4d] dark:text-[#daa916]">
            Área {orcamento.area_construida ? 'Construída' : 'Total'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#182b4d] dark:text-[#daa916]" />
            <div>
              <div className="text-2xl font-bold text-[#182b4d] dark:text-[#daa916]">
                {orcamento.area_construida ? orcamento.area_construida.toFixed(2) : orcamento.area_total.toFixed(2)}
              </div>
              <p className="text-xs text-[#182b4d] dark:text-[#daa916] mt-1">
                Metros quadrados {orcamento.area_construida ? '(construída)' : '(total)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Itens Detalhados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {itens.length}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Componentes do orçamento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Resumo dos itens por categoria (versão legado)
   */
  const ResumoItens: React.FC<{ itens: ItemOrcamento[] }> = ({ itens }) => {
    const resumoPorCategoria = itens.reduce((acc, item) => {
      const categoria = item.categoria;
      if (!acc[categoria]) {
        acc[categoria] = { total: 0, itens: 0 };
      }
      acc[categoria].total += item.valor_unitario_base * item.quantidade_estimada;
      acc[categoria].itens += 1;
      return acc;
    }, {} as Record<string, { total: number; itens: number }>);

    const totalGeral = Object.values(resumoPorCategoria).reduce((sum, cat) => sum + cat.total, 0);

    return (
      <div className="space-y-4">
        {Object.entries(resumoPorCategoria).map(([categoria, dados]) => {
          const percentual = totalGeral > 0 ? (dados.total / totalGeral) * 100 : 0;
          
          return (
            <div key={categoria} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{categoria.replace(/_/g, ' ')}</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {orcamentoUtils.formatarValor(dados.total)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dados.itens} itens • {percentual.toFixed(1)}%
                  </div>
                </div>
              </div>
              <Progress value={percentual} className="h-2" />
            </div>
          );
        })}
      </div>
    );
  };

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================

  // Verificar se o ID é válido
  if (!isValidId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                ID de orçamento inválido
              </CardTitle>
              <CardDescription>
                O identificador fornecido não é válido. Verifique a URL ou acesse a lista de orçamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard/orcamentos')} className="w-full">
                Ir para Lista de Orçamentos
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (orcamentoLoading || itensLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (orcamentoError || !orcamento) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Orçamento não encontrado
              </CardTitle>
              <CardDescription>
                O orçamento solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard/orcamentos')} className="w-full">
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Funcionalidade de composição detalhada removida - apenas orçamento paramétrico
  const temComposicaoDetalhada = false;

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
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/orcamentos')}
              className="flex items-center gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">{orcamento.nome_orcamento}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{TIPO_OBRA_LABELS[orcamento.tipo_obra]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{orcamento.cidade}/{orcamento.estado}</span>
                </div>
                <StatusBadge status={orcamento.status} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              onClick={handleRecalcular}
              disabled={recalculando}
              className={cn(
                "border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400",
                "hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
              )}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${recalculando ? 'animate-spin' : ''}`} />
              {recalculando ? 'Recalculando...' : 'Recalcular Orçamento'}
            </Button>
            
            {/* Botão de Conversão para Despesas */}
                {orcamento && orcamentosParametricosApi.podeConverterEmObra(orcamento) && itens.length > 0 && (
                  <Button
                    onClick={() => setMostrarModalConversao(true)}
                    disabled={convertendoDespesas}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Converter em Despesas
                  </Button>
                )}
            
            <Button
              variant="outline"
              onClick={handleDuplicar}
              className="hover:bg-accent transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            
            <Button 
              variant="outline"
              className="hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </motion.div>
        </div>

        {/* Estatísticas principais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EstatisticasOrcamento orcamento={orcamento} />
        </motion.div>

        {/* Conteúdo principal em abas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="resumo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="itens">Itens Detalhados</TabsTrigger>
              <TabsTrigger value="analise">Análise IA</TabsTrigger>
              <TabsTrigger value="dados">Dados Técnicos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            {/* Aba Composição Detalhada removida - apenas orçamento paramétrico */}

            {/* Aba Resumo */}
            <TabsContent value="resumo">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Composição de Custos
                    </CardTitle>
                    <CardDescription>
                      Resumo dos custos por categoria - Orçamento Paramétrico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumoItens itens={itens} />
                  </CardContent>
                </Card>

                <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Padrão Construtivo</p>
                        <p className="font-semibold">{PADRAO_OBRA_LABELS[orcamento.padrao_obra]}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Área Construída</p>
                        <p className="font-semibold">
                          {orcamento.area_construida?.toFixed(2) || 'Não informado'} m²
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CEP</p>
                        <p className="font-semibold">{orcamento.cep || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                        <p className="font-semibold">
                          Orçamento Paramétrico
                        </p>
                      </div>
                    </div>
                    
                    {orcamento.descricao && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
                        <p className="text-sm bg-muted p-3 rounded-md">{orcamento.descricao}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Itens Detalhados */}
            <TabsContent value="itens">
              <ItensDetalhados itens={itens} />
            </TabsContent>

            {/* Aba Análise IA */}
            <TabsContent value="analise">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Sugestões da IA
                    </CardTitle>
                    <CardDescription>
                      Análise baseada no orçamento paramétrico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(orcamento.sugestoes_ia && orcamento.sugestoes_ia.length === 0) || !orcamento.sugestoes_ia ? (
                      <p className="text-muted-foreground">Nenhuma sugestão disponível.</p>
                    ) : (
                      <ul className="space-y-2">
                        {orcamento.sugestoes_ia.map((sugestao, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <span className="text-sm">{sugestao}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Alertas da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(orcamento.alertas_ia && orcamento.alertas_ia.length === 0) || !orcamento.alertas_ia ? (
                      <p className="text-muted-foreground">Nenhum alerta identificado.</p>
                    ) : (
                      <ul className="space-y-2">
                        {orcamento.alertas_ia.map((alerta, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-[#daa916] mt-0.5" />
                            <span className="text-sm">{alerta}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Dados Técnicos */}
            <TabsContent value="dados">
              <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Parâmetros Técnicos</CardTitle>
                  <CardDescription>
                    Parâmetros do orçamento paramétrico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Parâmetros de Entrada</h4>
                      {orcamento.parametros_entrada ? (
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                          {JSON.stringify(orcamento.parametros_entrada, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-muted-foreground">Nenhum parâmetro definido.</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Parâmetros da IA</h4>
                      {orcamento.parametros_ia ? (
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                          {JSON.stringify(orcamento.parametros_ia, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-muted-foreground">Nenhum parâmetro da IA disponível.</p>
                      )}
                    </div>
                    
                    {ultimoCalculo?.estatisticas && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-3">Estatísticas do Último Cálculo</h4>
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                          {JSON.stringify(ultimoCalculo.estatisticas, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Histórico */}
            <TabsContent value="historico">
              <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Histórico de Alterações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Orçamento criado</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(orcamento.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    {orcamento.data_calculo && (
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">
                          Último cálculo da IA
                        </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(orcamento.data_calculo).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                      <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Última atualização</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(orcamento.updated_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Modal de Conversão para Despesas */}
      <Dialog open={mostrarModalConversao} onOpenChange={setMostrarModalConversao}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Converter Orçamento em Despesas
            </DialogTitle>
            <DialogDescription>
              Selecione a obra onde as despesas serão criadas a partir deste orçamento paramétrico.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Obra de Destino
              </label>
              <Select value={obraSelecionada} onValueChange={setObraSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma obra..." />
                </SelectTrigger>
                <SelectContent>
                  {obras?.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {orcamento && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Informações da Conversão:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {itens.length} itens serão convertidos em despesas</li>
                      <li>• Valor total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.custo_estimado)}</li>
                      <li>• As despesas serão marcadas como não pagas</li>
                      <li>• Você poderá editar as despesas após a conversão</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalConversao(false);
                setObraSelecionada("");
              }}
              disabled={convertendoDespesas}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConverterParaDespesas}
              disabled={!obraSelecionada || convertendoDespesas}
              className="bg-green-600 hover:bg-green-700"
            >
              {convertendoDespesas ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Convertendo...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Converter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default OrcamentoDetalhe;