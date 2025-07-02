import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Building, Plus, MapPin, Calendar, DollarSign, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { t, formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { useObras } from "@/hooks/useObras";


interface Obra {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  orcamento: number;
  data_inicio: string | null;
  data_prevista_termino: string | null;
  created_at: string;
}

const ObrasLista = () => {
  const navigate = useNavigate();
  const [obraToDelete, setObraToDelete] = useState<string | null>(null);
  const [selectedObras, setSelectedObras] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { obras, isLoading, error: isError, refetch, deleteObra } = useObras();

  const handleDelete = async () => {
    if (!obraToDelete) return;

    try {
      await deleteObra.mutateAsync(obraToDelete);
      setObraToDelete(null);
    } catch (error) {
      console.error("Error deleting obra:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedObras.length === 0) return;
    
    try {
      for (const id of selectedObras) {
        await deleteObra.mutateAsync(id);
      }
      setSelectedObras([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting obras:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedObras(obras?.map(o => o.id) || []);
    } else {
      setSelectedObras([]);
    }
  };

  const handleSelectObra = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedObras(prev => [...prev, id]);
    } else {
      setSelectedObras(prev => prev.filter(oId => oId !== id));
    }
  };

  // Função para calcular status da obra
  const getObraStatus = (obra: Obra) => {
    const hoje = new Date();
    const dataInicio = obra.data_inicio ? new Date(obra.data_inicio) : null;
    const dataFim = obra.data_prevista_termino ? new Date(obra.data_prevista_termino) : null;

    if (!dataInicio) return { label: "Não iniciada", color: "default" };
    if (dataInicio > hoje) return { label: "Planejada", color: "warning" };
    if (dataFim && dataFim < hoje) return { label: "Atrasada", color: "destructive" };
    return { label: "Em andamento", color: "info" };
  };

  const columns: ColumnDef<Obra>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedObras.length === obras?.length && obras?.length > 0}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedObras.includes(row.original.id)}
          onCheckedChange={(checked) => handleSelectObra(row.original.id, !!checked)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: t("obras.name"),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.nome}
        </div>
      ),
    },
    {
      accessorKey: "endereco",
      header: () => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {t("obras.address")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          <div>{row.original.endereco}</div>
          <div>{row.original.cidade} - {row.original.estado}</div>
        </div>
      ),
    },
    {
      accessorKey: "orcamento",
      header: () => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          {t("obras.budget")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrencyBR(row.original.orcamento)}
        </div>
      ),
    },
    {
      accessorKey: "data_inicio",
      header: () => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          Período
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-slate-700 dark:text-slate-300">Início: {formatDateBR(row.original.data_inicio)}</div>
          <div className="text-slate-500 dark:text-slate-400">Fim: {formatDateBR(row.original.data_prevista_termino)}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getObraStatus(row.original);
        const statusColors = {
          "Não iniciada": "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
          "Planejada": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-600",
          "Em andamento": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600",
          "Atrasada": "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-600"
        };
        return (
          <Badge className={`${statusColors[status.label as keyof typeof statusColors] || statusColors["Não iniciada"]}`}>
            {status.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: t("actions.title"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/dashboard/obras/${row.original.id}`)}
                  className="h-8 w-8 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("actions.view")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/dashboard/obras/${row.original.id}/editar`)}
                  className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("actions.edit")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/dashboard/orcamentos/novo?obra_id=${row.original.id}&return=/dashboard/obras`)}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Criar Orçamento IA</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setObraToDelete(row.original.id)}
                  className="h-8 w-8 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("actions.delete")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

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

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-destructive mb-4">{t("messages.error")}</p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
          >
            {t("actions.retry")}
          </Button>
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
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("obras.title")}</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas obras e projetos
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >

            
            <Button 
              onClick={() => navigate('/dashboard/orcamentos/novo')}
              variant="outline"
              className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Orçamento IA
            </Button>
            
            <Button asChild className={cn(
              "bg-gradient-to-r from-blue-500 to-blue-600",
              "hover:from-blue-600 hover:to-blue-700",
              "text-white shadow-lg",
              "transition-all duration-300 transform hover:scale-[1.02]"
            )}>
              <Link to="/dashboard/obras/nova">
                <Plus className="h-4 w-4 mr-2" />
                {t("obras.newObra")}
              </Link>
            </Button>
          </motion.div>
        </div>
        
        {/* Bulk Delete Button */}
        {selectedObras.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedObras.length} obra(s) selecionada(s)
            </span>
            <Button
              onClick={() => setShowBulkDeleteDialog(true)}
              variant="destructive"
              size="sm"
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Selecionadas
            </Button>
          </motion.div>
        )}
        
        {/* Estatísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Total de Obras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{obras?.length || 0}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Cadastradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {obras?.filter(o => getObraStatus(o).label === "Em andamento").length || 0}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Obras ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Orçamento Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyBR(obras?.reduce((sum, o) => sum + o.orcamento, 0) || 0)}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Valor investido
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
                Obras Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {obras?.filter(o => getObraStatus(o).label === "Atrasada").length || 0}
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                Requerem atenção
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Tabela de obras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <DataTable
                columns={columns}
                data={obras || []}
                searchKey="nome"
                searchPlaceholder="Buscar obras..."
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AlertDialog open={!!obraToDelete} onOpenChange={() => setObraToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("messages.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedObras.length} obra(s) selecionada(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      

    </DashboardLayout>
  );
};

export default ObrasLista;
