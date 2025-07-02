import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Download,
  MoreHorizontal,
  Trash2,
  Bot,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { useContratos } from "@/hooks/useContratos";
import { useObras } from "@/hooks/useObras";


interface Contrato {
  id: string;
  numero_contrato: string;
  titulo: string;
  obra_id: string;
  obras?: { nome: string };
  contratado_nome: string;
  contratado_documento: string;
  valor_total: number;
  status: string;
  data_inicio?: string;
  prazo_execucao: number;
  created_at: string;
  url_documento?: string;
}

const ContratosLista = () => {
  const navigate = useNavigate();
  const [selectedObraId, setSelectedObraId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [contratoToDelete, setContratoToDelete] = useState<string | null>(null);
  const [selectedContratos, setSelectedContratos] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { contratos, isLoading, error, deleteContrato } = useContratos();
  const { obras } = useObras();

  // Filtrar contratos
  const filteredContratos = contratos?.filter(contrato => {
    const obraMatch = selectedObraId === "all" || contrato.obra_id === selectedObraId;
    const statusMatch = selectedStatus === "all" || contrato.status === selectedStatus;
    return obraMatch && statusMatch;
  });

  // Calcular métricas
  const totalContratos = contratos?.length || 0;
  const contratosAtivos = contratos?.filter(c => c.status === 'ATIVO').length || 0;
  const contratosAguardando = contratos?.filter(c => c.status === 'AGUARDANDO_ASSINATURA').length || 0;
  const valorTotalContratos = contratos?.reduce((sum, c) => sum + c.valor_total, 0) || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; label: string; icon?: React.ComponentType }> = {
      'RASCUNHO': { variant: 'secondary', label: 'Rascunho', icon: Edit },
      'AGUARDANDO_ASSINATURA': { variant: 'warning', label: 'Aguardando Assinatura', icon: Clock },
      'ATIVO': { variant: 'success', label: 'Ativo', icon: CheckCircle },
      'CONCLUIDO': { variant: 'default', label: 'Concluído', icon: CheckCircle },
      'CANCELADO': { variant: 'destructive', label: 'Cancelado', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig['RASCUNHO'];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const handleDelete = async () => {
    if (contratoToDelete) {
      await deleteContrato.mutateAsync(contratoToDelete);
      setContratoToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    for (const contratoId of selectedContratos) {
      await deleteContrato.mutateAsync(contratoId);
    }
    setSelectedContratos([]);
    setShowBulkDeleteDialog(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredContratos?.map(contrato => contrato.id) || [];
      setSelectedContratos(allIds);
    } else {
      setSelectedContratos([]);
    }
  };

  const handleSelectContrato = (contratoId: string, checked: boolean) => {
    if (checked) {
      setSelectedContratos(prev => [...prev, contratoId]);
    } else {
      setSelectedContratos(prev => prev.filter(id => id !== contratoId));
    }
  };

  const columns: ColumnDef<Contrato>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value);
          }}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedContratos.includes(row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleSelectContrato(row.original.id, !!value);
          }}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "numero_contrato",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.numero_contrato}
        </div>
      ),
    },
    {
      accessorKey: "titulo",
      header: "Título",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{row.original.titulo}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateBR(row.original.created_at)}
          </p>
        </div>
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
      accessorKey: "contratado_nome",
      header: "Contratado",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.contratado_nome || "-"}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.contratado_documento || "-"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "valor_total",
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrencyBR(row.original.valor_total)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },

    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const contrato = row.original;
        const [gerandoPDF, setGerandoPDF] = useState(false);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => navigate(`/dashboard/contratos/${contrato.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              
              {contrato.status === 'RASCUNHO' && (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/contratos/${contrato.id}/editar`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/contratos/${contrato.id}/editar-ia`)}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Editar com IA
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/contratos/${contrato.id}/enviar`)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar para Assinatura
                  </DropdownMenuItem>
                </>
              )}
              
                              {contrato.url_documento && (
                  <DropdownMenuItem 
                    onClick={() => window.open(contrato.url_documento, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Documento
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setContratoToDelete(contrato.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando contratos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">Erro ao carregar contratos</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
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
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contratos</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus contratos de obra</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            {selectedContratos.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Selecionados ({selectedContratos.length})
              </Button>
            )}
            <Button 
              asChild 
              className={cn(
                "bg-gradient-to-r from-blue-500 to-purple-600",
                "hover:from-blue-600 hover:to-purple-700",
                "text-white shadow-lg",
                "transition-all duration-300"
              )}
            >
              <Link to="/dashboard/contratos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Bot className="h-4 w-4" />
                  Assistente IA
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Criar com IA</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/contratos/novo-ia">
                    <Bot className="mr-2 h-4 w-4" />
                    Novo Contrato com IA
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            title="Total de Contratos"
            value={totalContratos.toString()}
            icon={FileText}
            iconColor="primary"
            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <MetricCard
            title="Contratos Ativos"
            value={contratosAtivos.toString()}
            icon={CheckCircle}
            iconColor="success"
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
          />
          <MetricCard
            title="Aguardando Assinatura"
            value={contratosAguardando.toString()}
            icon={Clock}
            iconColor="warning"
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
          />
          <MetricCard
            title="Valor Total"
            value={formatCurrencyBR(valorTotalContratos)}
            icon={AlertCircle}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Status
                  </label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                      <SelectItem value="AGUARDANDO_ASSINATURA">Aguardando Assinatura</SelectItem>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
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
              <DataTable
                columns={columns}
                data={filteredContratos || []}
                searchKey="titulo"
                searchPlaceholder="Buscar por título..."
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de confirmação de exclusão */}
        <AlertDialog open={!!contratoToDelete} onOpenChange={() => setContratoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir este contrato? Esta ação não pode ser desfeita.
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

        {/* Modal de confirmação de exclusão em massa */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir {selectedContratos.length} contrato(s) selecionado(s)? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir {selectedContratos.length} contrato(s)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
      

    </DashboardLayout>
  );
};

export default ContratosLista;