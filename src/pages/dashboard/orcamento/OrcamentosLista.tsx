/**
 * 📊 Página de Lista de Orçamentos Paramétricos
 * 
 * Interface principal para visualização e gerenciamento de orçamentos
 * criados com IA e dados técnicos da construção civil.
 * 
 * @author ObrasAI Team
 * @version 2.0.0 - Orçamento Paramétrico
 */

import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Calculator, 
  Plus, 
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
  Filter,
  Search,
  Building,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle,
  Users,
  Hammer
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { orcamentosParametricosApi, orcamentoUtils, itensOrcamentoApi } from "@/services/orcamentoApi";
import { 
  OrcamentoParametrico, 
  StatusOrcamento,
  TipoObra,
  PadraoObra,
  TIPO_OBRA_LABELS,
  PADRAO_OBRA_LABELS,
  STATUS_ORCAMENTO_LABELS,
  STATUS_ORCAMENTO_CORES
} from "@/lib/validations/orcamento";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface FiltrosState {
  busca: string;
  status?: StatusOrcamento;
  tipo_obra?: TipoObra;
  padrao_obra?: PadraoObra;
}

// ====================================
// 🏗️ COMPONENTE PRINCIPAL
// ====================================

const OrcamentosLista: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados locais
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: "",
  });
  const [orcamentoParaExcluir, setOrcamentoParaExcluir] = useState<string | null>(null);

  // Query dos orçamentos
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['orcamentos-parametricos', filtros],
    queryFn: () => orcamentosParametricosApi.getAll({
      ...filtros,
      limit: 20,
      offset: 0
    })
  });

  const orcamentos = response?.data || [];

  // Query para verificar itens dos orçamentos (orçamento paramétrico)
  const { data: orcamentosComItens } = useQuery({
    queryKey: ['orcamentos-com-itens'],
    queryFn: async () => {
      const promises = orcamentos.map(async (orc) => {
        try {
          const itens = await itensOrcamentoApi.getByOrcamento(orc.id);
          // Funcionalidade de composição detalhada removida - apenas orçamento paramétrico
          const temComposicaoDetalhada = false;
          return { ...orc, temComposicaoDetalhada, totalItens: itens.length };
        } catch {
          return { ...orc, temComposicaoDetalhada: false, totalItens: 0 };
        }
      });
      return Promise.all(promises);
    },
    enabled: orcamentos.length > 0
  });

  const orcamentosEnriquecidos = orcamentosComItens || orcamentos.map(orc => ({ 
    ...orc, 
    temComposicaoDetalhada: false, 
    totalItens: 0 
  }));

  // ====================================
  // 🎯 HANDLERS DE EVENTOS
  // ====================================

  /**
   * Duplicar orçamento
   */
  const handleDuplicar = async (orcamento: OrcamentoParametrico) => {
    try {
      const duplicado = await orcamentosParametricosApi.duplicate(
        orcamento.id, 
        `${orcamento.nome_orcamento} (Cópia)`
      );
      toast.success("🎉 Orçamento duplicado com sucesso!");
      refetch();
    } catch (error) {
      console.error("Erro ao duplicar orçamento:", error);
      toast.error("❌ Erro ao duplicar orçamento");
    }
  };

  /**
   * Excluir orçamento
   */
  const handleExcluir = async (id: string) => {
    try {
      await orcamentosParametricosApi.delete(id);
      toast.success("🗑️ Orçamento excluído com sucesso!");
      setOrcamentoParaExcluir(null);
      refetch();
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
      toast.error("❌ Erro ao excluir orçamento");
    }
  };

  // ====================================
  // 🎨 COMPONENTES AUXILIARES
  // ====================================

  /**
   * Badge de status com cores
   */
  const StatusBadge: React.FC<{ status: StatusOrcamento }> = ({ status }) => (
    <Badge className={STATUS_ORCAMENTO_CORES[status]}>
      {STATUS_ORCAMENTO_LABELS[status]}
    </Badge>
  );

  /**
   * Indicador de versão da IA
   */
  const IndicadorVersaoIA: React.FC<{ orcamento: { versao_ia?: boolean; id: string } }> = ({ orcamento }) => {
    return (
      <Badge variant="outline" className="bg-[#daa916]/20 text-[#daa916] border-[#daa916]/30 text-xs px-2 py-0.5">
        <Sparkles className="h-3 w-3 mr-1" />
        Paramétrico
      </Badge>
    );
  };

  /**
   * Estatísticas rápidas
   */
  const estatisticas = useMemo(() => {
    const total = orcamentosEnriquecidos.length;
    const valorTotal = orcamentosEnriquecidos.reduce((sum, orc) => sum + orc.custo_estimado, 0);
    const areaTotalConstruida = orcamentosEnriquecidos.reduce((sum, orc) => {
      return sum + (orc.area_construida || orc.area_total || 0);
    }, 0);
    const concluidos = orcamentosEnriquecidos.filter(orc => orc.status === 'CONCLUIDO').length;
    const rascunhos = orcamentosEnriquecidos.filter(orc => orc.status === 'RASCUNHO').length;
    // Funcionalidade de composição detalhada removida
    const comComposicaoDetalhada = 0;

    return { total, valorTotal, areaTotalConstruida, concluidos, rascunhos, comComposicaoDetalhada };
  }, [orcamentosEnriquecidos]);

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================

  if (isLoading) {
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Erro ao carregar orçamentos
              </CardTitle>
              <CardDescription>
                Ocorreu um erro ao carregar a lista de orçamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} className="w-full">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
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
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Orçamentos Paramétricos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas estimativas com inteligência artificial
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => navigate('/dashboard/orcamentos/novo')}
              className={cn(
                "bg-gradient-to-r from-cyan-500 to-cyan-600",
                "hover:from-cyan-600 hover:to-cyan-700",
                "text-white shadow-lg",
                "transition-all duration-300 transform hover:scale-[1.02]"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento Paramétrico
            </Button>
          </motion.div>
        </div>

        {/* Estatísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Total de Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{estatisticas.total}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Cadastrados no sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {orcamentoUtils.formatarValor(estatisticas.valorTotal)}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Valor estimado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estatisticas.concluidos}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Finalizados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{estatisticas.rascunhos}</div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Em andamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Área Total Construída
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {estatisticas.areaTotalConstruida.toFixed(0)} m²
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Área construída total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Nome, cidade, tipo..."
                      value={filtros.busca}
                      onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={filtros.status || "ALL"}
                    onValueChange={(value) => setFiltros(prev => ({ 
                      ...prev, 
                      status: value === "ALL" ? undefined : value as StatusOrcamento 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os status</SelectItem>
                      <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                      <SelectItem value="CALCULANDO">Calculando</SelectItem>
                      <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                      <SelectItem value="ERRO">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Obra</label>
                  <Select
                    value={filtros.tipo_obra || "ALL"}
                    onValueChange={(value) => setFiltros(prev => ({ 
                      ...prev, 
                      tipo_obra: value === "ALL" ? undefined : value as TipoObra 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os tipos</SelectItem>
                      <SelectItem value="RESIDENCIAL">Residencial</SelectItem>
                      <SelectItem value="COMERCIAL">Comercial</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                      <SelectItem value="INFRAESTRUTURA">Infraestrutura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Padrão</label>
                  <Select
                    value={filtros.padrao_obra || "ALL"}
                    onValueChange={(value) => setFiltros(prev => ({ 
                      ...prev, 
                      padrao_obra: value === "ALL" ? undefined : value as PadraoObra 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os padrões" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os padrões</SelectItem>
                      <SelectItem value="BAIXO">Baixo</SelectItem>
                      <SelectItem value="MEDIO">Médio</SelectItem>
                      <SelectItem value="ALTO">Alto</SelectItem>
                      <SelectItem value="LUXO">Luxo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de orçamentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Lista de Orçamentos ({orcamentosEnriquecidos.length})</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus orçamentos paramétricos
                {/* Funcionalidade de composição detalhada removida */}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {orcamentosEnriquecidos.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro orçamento para começar.
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard/orcamentos/novo')}
                    className="bg-gradient-to-r from-blue-600 to-[#182b4d] hover:from-blue-700 hover:to-[#182b4d]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Orçamento Paramétrico
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orçamento</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Tipo/Padrão</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Custo Estimado</TableHead>
                      <TableHead>Versão IA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentosEnriquecidos.map((orcamento) => (
                      <TableRow key={orcamento.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{orcamento.nome_orcamento}</p>
                            {orcamento.descricao && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {orcamento.descricao}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {orcamento.cidade}/{orcamento.estado}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                              {TIPO_OBRA_LABELS[orcamento.tipo_obra]}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {PADRAO_OBRA_LABELS[orcamento.padrao_obra]}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {orcamento.area_construida ? orcamento.area_construida.toFixed(2) : orcamento.area_total.toFixed(2)} m²
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {orcamento.area_construida ? '(construída)' : '(total)'}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium text-emerald-600 dark:text-emerald-400">
                              {orcamentoUtils.formatarValor(orcamento.custo_estimado)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {orcamentoUtils.formatarValor(orcamento.custo_m2)}/m²
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <IndicadorVersaoIA orcamento={orcamento} />
                        </TableCell>
                        
                        <TableCell>
                          <StatusBadge status={orcamento.status} />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(orcamento.updated_at).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                ⋮
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/dashboard/orcamentos/${orcamento.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicar(orcamento)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setOrcamentoParaExcluir(orcamento.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modal de confirmação de exclusão */}
      {orcamentoParaExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Excluir Orçamento</CardTitle>
              <CardDescription>
                Esta ação não pode ser desfeita. O orçamento será excluído permanentemente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setOrcamentoParaExcluir(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleExcluir(orcamentoParaExcluir)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrcamentosLista;