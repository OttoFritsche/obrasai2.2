import { useState } from "react";
import { Constants } from "@/integrations/supabase/types";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  Filter,
  Loader2,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { useDespesas } from "@/hooks/useDespesas";
import { useObras } from "@/hooks/useObras";
import { calculateDespesasMetrics, calculatePeriodTrend } from "@/lib/utils/metrics";

interface Despesa {
  id: string;
  descricao: string;
  obra_id: string;
  obras: {
    nome: string;
  };
  categoria: string;
  insumo: string;
  custo: number;
  data_despesa: string;
  pago: boolean;
  data_pagamento: string | null;
}

const DespesasLista = () => {
  const navigate = useNavigate();
  const [despesaToDelete, setDespesaToDelete] = useState<string | null>(null);
  const [selectedDespesas, setSelectedDespesas] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedObraId, setSelectedObraId] = useState<string>("all");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all");
  const [selectedEtapa, setSelectedEtapa] = useState<string>("all");

  const { despesas, isLoading, error, refetch, deleteDespesa } = useDespesas();
  const { obras } = useObras();

  const filteredDespesas = despesas?.filter(despesa => {
    const obraMatch = selectedObraId === "all" || despesa.obra_id === selectedObraId;
    const categoriaMatch = selectedCategoria === "all" || despesa.categoria === selectedCategoria;
    const etapaMatch = selectedEtapa === "all" || despesa.etapa === selectedEtapa;
    return obraMatch && categoriaMatch && etapaMatch;
  });

  // Calcular métricas reais usando a função utilitária
  const metrics = calculateDespesasMetrics(despesas || [], filteredDespesas || []);
  
  // Calcular tendências baseadas em dados históricos reais
  const trendTotalDespesas = calculatePeriodTrend(despesas || [], 'custo', 'data_despesa');
  const trendDespesasPagas = calculatePeriodTrend(
    despesas?.filter(d => d.pago) || [], 
    'custo', 
    'data_pagamento'
  );

  const handleDelete = async () => {
    if (!despesaToDelete) return;

    try {
      await deleteDespesa.mutateAsync(despesaToDelete);
      setDespesaToDelete(null);
    } catch (error) {
      console.error("Error deleting despesa:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDespesas.length === 0) return;

    try {
      // Delete each selected despesa
      for (const despesaId of selectedDespesas) {
        await deleteDespesa.mutateAsync(despesaId);
      }
      setSelectedDespesas([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting despesas:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredDespesas?.map(despesa => despesa.id) || [];
      setSelectedDespesas(allIds);
    } else {
      setSelectedDespesas([]);
    }
  };

  const handleSelectDespesa = (despesaId: string, checked: boolean) => {
    if (checked) {
      setSelectedDespesas(prev => [...prev, despesaId]);
    } else {
      setSelectedDespesas(prev => prev.filter(id => id !== despesaId));
    }
  };

  const columns: ColumnDef<Despesa>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedDespesas.length === filteredDespesas?.length && filteredDespesas?.length > 0}
          onCheckedChange={(value) => handleSelectAll(!!value)}
          aria-label="Selecionar todas"
          className="border-slate-300 dark:border-slate-600"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedDespesas.includes(row.original.id)}
          onCheckedChange={(value) => handleSelectDespesa(row.original.id, !!value)}
          aria-label="Selecionar linha"
          className="border-slate-300 dark:border-slate-600"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.descricao}</div>
      ),
    },
    {
      accessorKey: "obras.nome",
      header: "Obra",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.obras?.nome || "-"}
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className="text-xs bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300"
        >
          {row.original.categoria || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "insumo",
      header: "Insumo",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.insumo || "-"}</span>
      ),
    },
    {
      accessorKey: "custo",
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrencyBR(row.original.custo)}
        </span>
      ),
    },
    {
      accessorKey: "data_despesa",
      header: "Data",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateBR(row.original.data_despesa)}
        </span>
      ),
    },
    {
      accessorKey: "pago",
      header: "Status",
      cell: ({ row }) => 
        row.original.pago ? (
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50">
            <Check className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => navigate(`/dashboard/despesas/${row.original.id}/editar`)}
            className="h-8 w-8 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            onClick={() => setDespesaToDelete(row.original.id)}
            className="h-8 w-8 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
            <p className="text-muted-foreground">Carregando despesas...</p>
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
            <h3 className="text-lg font-semibold">Erro ao carregar despesas</h3>
            <p className="text-muted-foreground">Não foi possível carregar a lista de despesas.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
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
            <div className="h-10 w-10 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Despesas</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie todas as despesas das obras
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {selectedDespesas.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Selecionadas ({selectedDespesas.length})
              </Button>
            )}
            <Button 
              asChild 
              className={cn(
                "bg-gradient-to-r from-green-500 to-green-600",
                "hover:from-green-600 hover:to-green-700",
                "text-white shadow-lg",
                "transition-all duration-300"
              )}
            >
              <Link to="/dashboard/despesas/nova">
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Cards de métricas com dados reais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Total de Despesas"
            value={metrics.totalDespesas.toString()}
            icon={Receipt}
            trend={trendTotalDespesas}
            iconColor="primary"
            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <MetricCard
            title="Valor Total"
            value={formatCurrencyBR(metrics.totalValor)}
            icon={Receipt}
            trend={trendTotalDespesas}
            iconColor="success"
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700"
          />
          <MetricCard
            title="Despesas Pagas"
            value={metrics.despesasPagas.toString()}
            icon={Check}
            trend={trendDespesasPagas}
            iconColor="success"
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
          />
          <MetricCard
            title="Valor Pago"
            value={formatCurrencyBR(metrics.valorPago)}
            icon={Check}
            trend={trendDespesasPagas}
            iconColor="info"
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          />
        </motion.div>
        
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-indigo-200/50 dark:border-indigo-700/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <span className="text-indigo-700 dark:text-indigo-300">Filtros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                    Obra
                  </label>
                  <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
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
                
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                    Categoria
                  </label>
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {Constants.public.Enums.categoria_enum.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                    Etapa
                  </label>
                  <Select value={selectedEtapa} onValueChange={setSelectedEtapa}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                      <SelectValue placeholder="Todas as etapas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as etapas</SelectItem>
                      {Constants.public.Enums.etapa_enum.map((etapa) => (
                        <SelectItem key={etapa} value={etapa}>
                          {etapa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabela */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <DataTable columns={columns} data={filteredDespesas || []} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de confirmação de exclusão individual */}
        <AlertDialog open={!!despesaToDelete} onOpenChange={() => setDespesaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir esta despesa? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação de exclusão em lote */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão em lote</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir {selectedDespesas.length} despesa(s) selecionada(s)? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir {selectedDespesas.length} despesa(s)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default DespesasLista;
