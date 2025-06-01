import { useState } from "react";
import { Constants } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Pencil, 
  Trash2, 
  FileText, 
  Plus, 
  Check, 
  Filter,
  Loader2,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { despesasApi, obrasApi } from "@/services/api";
import { t, formatCurrencyBR, formatDateBR } from "@/lib/i18n";

type Despesa = {
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
};

const DespesasLista = () => {
  const navigate = useNavigate();
  const [despesaToDelete, setDespesaToDelete] = useState<string | null>(null);
  const [selectedObraId, setSelectedObraId] = useState<string>("all");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all");
  const [selectedEtapa, setSelectedEtapa] = useState<string>("all");

  const { data: despesas, isLoading, isError, refetch } = useQuery({
    queryKey: ["despesas"],
    queryFn: despesasApi.getAll,
  });

  const { data: obras } = useQuery({
    queryKey: ["obras"],
    queryFn: obrasApi.getAll,
  });

  const filteredDespesas = despesas?.filter(despesa => {
    const obraMatch = selectedObraId === "all" || despesa.obra_id === selectedObraId;
    const categoriaMatch = selectedCategoria === "all" || despesa.categoria === selectedCategoria;
    const etapaMatch = selectedEtapa === "all" || despesa.etapa === selectedEtapa;
    return obraMatch && categoriaMatch && etapaMatch;
  });

  // Calcular métricas
  const totalDespesas = filteredDespesas?.length || 0;
  const totalValor = filteredDespesas?.reduce((sum, despesa) => sum + despesa.custo, 0) || 0;
  const despesasPagas = filteredDespesas?.filter(d => d.pago).length || 0;
  const valorPago = filteredDespesas?.filter(d => d.pago).reduce((sum, despesa) => sum + despesa.custo, 0) || 0;

  const handleDelete = async () => {
    if (!despesaToDelete) return;

    try {
      await despesasApi.delete(despesaToDelete);
      refetch();
      setDespesaToDelete(null);
    } catch (error) {
      console.error("Error deleting despesa:", error);
    }
  };

  const columns: ColumnDef<Despesa>[] = [
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
        <Badge variant="outline" className="text-xs">
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
        <span className="font-mono font-medium">
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
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <Check className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        ) : (
          <Badge variant="outline" className="border-orange-500/20 text-orange-600">
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
            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            onClick={() => setDespesaToDelete(row.original.id)}
            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
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

  if (isError) {
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
          >
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

        {/* Cards de métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Total de Despesas"
            value={totalDespesas.toString()}
            icon={Receipt}
            trend={{ value: 12, isUpward: true }}
            color="blue"
          />
          <MetricCard
            title="Valor Total"
            value={formatCurrencyBR(totalValor)}
            icon={Receipt}
            trend={{ value: 8, isUpward: false }}
            color="green"
          />
          <MetricCard
            title="Despesas Pagas"
            value={despesasPagas.toString()}
            icon={Check}
            trend={{ value: 15, isUpward: true }}
            color="purple"
          />
          <MetricCard
            title="Valor Pago"
            value={formatCurrencyBR(valorPago)}
            icon={Check}
            trend={{ value: 5, isUpward: true }}
            color="orange"
          />
        </motion.div>
        
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-blue-500" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Obra
                  </label>
                  <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                    <SelectTrigger className="bg-background/50">
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
                  <label className="text-sm font-medium mb-2 block">
                    Categoria
                  </label>
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="bg-background/50">
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
                  <label className="text-sm font-medium mb-2 block">
                    Etapa
                  </label>
                  <Select value={selectedEtapa} onValueChange={setSelectedEtapa}>
                    <SelectTrigger className="bg-background/50">
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
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <DataTable columns={columns} data={filteredDespesas || []} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de confirmação de exclusão */}
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
      </motion.div>
    </DashboardLayout>
  );
};

export default DespesasLista;
