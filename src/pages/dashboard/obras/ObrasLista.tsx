import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Building, Plus, MapPin, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { obrasApi } from "@/services/api";
import { t, formatCurrencyBR, formatDateBR } from "@/lib/i18n";

type Obra = {
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
};

const ObrasLista = () => {
  const navigate = useNavigate();
  const [obraToDelete, setObraToDelete] = useState<string | null>(null);

  const { data: obras, isLoading, isError, refetch } = useQuery({
    queryKey: ["obras"],
    queryFn: obrasApi.getAll,
  });

  const handleDelete = async () => {
    if (!obraToDelete) return;

    try {
      await obrasApi.delete(obraToDelete);
      refetch();
      setObraToDelete(null);
    } catch (error) {
      console.error("Error deleting obra:", error);
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
          <DollarSign className="h-4 w-4" />
          {t("obras.budget")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-green-600 dark:text-green-500">
          {formatCurrencyBR(row.original.orcamento)}
        </div>
      ),
    },
    {
      accessorKey: "data_inicio",
      header: () => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Período
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <div>Início: {formatDateBR(row.original.data_inicio)}</div>
          <div className="text-muted-foreground">Fim: {formatDateBR(row.original.data_prevista_termino)}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getObraStatus(row.original);
        return (
          <Badge variant={status.color as any}>
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
                  className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
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
                  className="h-8 w-8 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors"
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
                  onClick={() => setObraToDelete(row.original.id)}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-500 dark:text-purple-400" />
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
          >
            <Button asChild className={cn(
              "bg-gradient-to-r from-purple-500 to-purple-600",
              "hover:from-purple-600 hover:to-purple-700",
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
        
        {/* Estatísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Obras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obras?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {obras?.filter(o => getObraStatus(o).label === "Em andamento").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Obras ativas
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orçamento Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrencyBR(obras?.reduce((sum, o) => sum + o.orcamento, 0) || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor investido
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Obras Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {obras?.filter(o => getObraStatus(o).label === "Atrasada").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
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
    </DashboardLayout>
  );
};

export default ObrasLista;
