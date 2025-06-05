/**
 * 📋 Página de Detalhes do Orçamento Paramétrico
 * 
 * Interface para visualização completa de um orçamento com
 * todos os detalhes técnicos e análises da IA.
 * 
 * @author ObrasAI Team
 * @version 2.0.0 - Integração com Composição Detalhada v9.0.0
 */

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Edit,
  RefreshCcw,
  BarChart3,
  PieChart,
  FileText,
  Eye,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import ComposicaoDetalhada from "@/components/orcamento/ComposicaoDetalhada";
import { orcamentosParametricosApi, itensOrcamentoApi, calculoOrcamentoApi, orcamentoUtils } from "@/services/orcamentoApi";
import { 
  OrcamentoParametrico,
  ItemOrcamento,
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
  const [ultimoCalculo, setUltimoCalculo] = useState<any>(null);

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
    refetch: refetchItens
  } = useQuery({
    queryKey: ['itens-orcamento', id],
    queryFn: () => itensOrcamentoApi.getByOrcamento(id!),
    enabled: !!isValidId
  });

  // ====================================
  // 🎯 HANDLERS DE EVENTOS
  // ====================================

  /**
   * Recalcular orçamento com IA (v9.0.0 prioritária)
   */
  const handleRecalcular = async () => {
    if (!id) return;

    try {
      setRecalculando(true);
      toast.info("🤖 Recalculando orçamento com IA v9.0.0...");

      const resultado = await calculoOrcamentoApi.recalcular(id);
      
      if (resultado.success) {
        setUltimoCalculo(resultado);
        
        // Mostrar informações detalhadas do cálculo
        const stats = resultado.estatisticas;
        if (stats?.composicao_detalhada) {
          toast.success(
            `✨ Orçamento recalculado com sucesso!\n` +
            `💰 ${orcamentoUtils.formatarValor(resultado.orcamento.custo_estimado)}\n` +
            `🏗️ ${stats.composicao_detalhada.total_itens} itens em ${stats.composicao_detalhada.resumo_etapas?.length || 0} etapas\n` +
            `👷 ${stats.composicao_detalhada.percentual_mao_obra}% mão de obra`,
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
    } catch (error: any) {
      console.error("Erro ao recalcular:", error);
      toast.error(`❌ Erro ao recalcular orçamento: ${error.message}`);
    } finally {
      setRecalculando(false);
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

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Área Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {orcamento.area_total.toFixed(2)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Metros quadrados
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

  // Verificar se tem composição detalhada v9.0.0
  const temComposicaoDetalhada = itens.length > 20 || 
    (ultimoCalculo?.estatisticas?.composicao_detalhada) ||
    itens.some(item => item.observacoes?.includes('v9.0.0'));

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
                {temComposicaoDetalhada && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    v9.0.0
                  </Badge>
                )}
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
              {recalculando ? 'Recalculando...' : 'Recalcular IA v9.0.0'}
            </Button>
            
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
          <Tabs defaultValue={temComposicaoDetalhada ? "composicao" : "resumo"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              {temComposicaoDetalhada && (
                <TabsTrigger value="composicao" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Composição v9.0.0
                </TabsTrigger>
              )}
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="itens">Itens Detalhados</TabsTrigger>
              <TabsTrigger value="analise">Análise IA</TabsTrigger>
              <TabsTrigger value="dados">Dados Técnicos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            {/* Aba Composição Detalhada v9.0.0 */}
            {temComposicaoDetalhada && (
              <TabsContent value="composicao">
                <ComposicaoDetalhada 
                  itens={itens}
                  composicao={ultimoCalculo?.estatisticas?.composicao_detalhada}
                  custoTotal={orcamento.custo_estimado}
                />
              </TabsContent>
            )}

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
                      {temComposicaoDetalhada ? (
                        <span className="text-purple-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Análise detalhada disponível na aba "Composição v9.0.0"
                        </span>
                      ) : (
                        "Resumo básico dos custos por categoria"
                      )}
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
                        <p className="text-sm font-medium text-muted-foreground">Versão IA</p>
                        <p className="font-semibold flex items-center gap-1">
                          {temComposicaoDetalhada ? (
                            <>
                              <Sparkles className="h-3 w-3 text-green-600" />
                              v9.0.0 Detalhada
                            </>
                          ) : (
                            'Padrão'
                          )}
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
              <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Itens do Orçamento</CardTitle>
                  <CardDescription>
                    {itens.length} itens encontrados • Total: {orcamentoUtils.formatarValor(
                      itens.reduce((sum, item) => sum + (item.valor_unitario_base * item.quantidade_estimada), 0)
                    )}
                    {temComposicaoDetalhada && (
                      <span className="ml-2 text-purple-600">
                        • Composição detalhada v9.0.0 ativa
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {itens.length === 0 ? (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Os itens serão gerados automaticamente pela IA durante o cálculo.
                      </p>
                      <Button onClick={handleRecalcular} disabled={recalculando}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Calcular com IA v9.0.0
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Etapa</TableHead>
                          <TableHead>Insumo</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Valor Unitário</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300">
                                {item.categoria.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.etapa.replace(/_/g, ' ')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.insumo}
                              {item.observacoes?.includes('v9.0.0') && (
                                <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                                  v9.0.0
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{item.quantidade_estimada.toFixed(2)}</TableCell>
                            <TableCell>{item.unidade_medida}</TableCell>
                            <TableCell>
                              {orcamentoUtils.formatarValor(item.valor_unitario_base)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                              {orcamentoUtils.formatarValor(
                                item.valor_unitario_base * item.quantidade_estimada
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
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
                    {temComposicaoDetalhada && (
                      <CardDescription className="text-purple-600 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Análise avançada v9.0.0 com composição detalhada
                      </CardDescription>
                    )}
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
                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
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
                  {temComposicaoDetalhada && (
                    <CardDescription className="text-purple-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Dados gerados com IA v9.0.0 - Composição Detalhada
                    </CardDescription>
                  )}
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
                          <p className="font-medium flex items-center gap-1">
                            Último cálculo da IA
                            {temComposicaoDetalhada && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                v9.0.0
                              </Badge>
                            )}
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
    </DashboardLayout>
  );
};

export default OrcamentoDetalhe; 