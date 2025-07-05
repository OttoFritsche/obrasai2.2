// Bibliotecas externas
import type { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Building, Calculator, Calendar, DollarSign, Eye, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Componentes de layout
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Componentes UI
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { GradientCard } from "@/components/ui/GradientCard";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hooks
import { useObras } from "@/hooks/useObras";

// Utilitários
import { formatCurrencyBR, formatDateBR, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Obra {
  id: string;
  nome: string;
  endereco: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep: string;
  orcamento_total: number;
  descricao?: string;
  status?: string;
  data_inicio: string | null;
  data_fim: string | null;
  tenant_id?: string;
  construtora_id?: string;
  created_at: string;
  updated_at?: string;
  // Campos antigos para compatibilidade
  orcamento?: number;
  data_prevista_termino?: string | null;
}

const ObrasListaRefactored = () => {
  const navigate = useNavigate();
  const [obraToDelete, setObraToDelete] = useState<string | null>(null);

  const { obras, isLoading, error: isError, refetch, deleteObra } = useObras();

  const handleDelete = async () => {
    if (!obraToDelete) return;

    try {
      await deleteObra.mutateAsync(obraToDelete);
      setObraToDelete(null);
    } catch (_error) {
      console.error("Error deleting obra:", error);
    }
  };

  // Função para calcular status da obra
  const getObraStatus = (obra: Obra) => {
    const hoje = new Date();
    const dataInicio = obra.data_inicio ? new Date(obra.data_inicio) : null;
    const dataFim = obra.data_fim ? new Date(obra.data_fim) : 
                   (obra.data_prevista_termino ? new Date(obra.data_prevista_termino) : null);

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
        {/* Header usando o componente refatorado */}
        <PageHeader
          icon={Building}
          title={t("obras.title")}
          description="Gerencie suas obras e projetos"
          actions={
            <div className="flex items-center gap-3">
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
            </div>
          }
        />
        
        {/* Estatísticas rápidas usando GradientCard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <GradientCard
            title="Total de Obras"
            value={obras?.length || 0}
            description="Cadastradas no sistema"
            variant="slate"
          />

          <GradientCard
            title="Em Andamento"
            value={obras?.filter(o => getObraStatus(o).label === "Em andamento").length || 0}
            description="Obras ativas"
            variant="blue"
          />

          <GradientCard
            title="Orçamento Total"
            value={formatCurrencyBR(obras?.reduce((sum, o) => sum + o.orcamento, 0) || 0)}
            description="Valor investido"
            variant="emerald"
          />

          <GradientCard
            title="Obras Atrasadas"
            value={obras?.filter(o => getObraStatus(o).label === "Atrasada").length || 0}
            description="Requerem atenção"
            variant="rose"
          />
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
    </DashboardLayout>
  );
};

export default ObrasListaRefactored;