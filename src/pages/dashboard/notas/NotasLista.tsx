import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  Pencil, 
  Trash2, 
  FileText, 
  Plus, 
  Filter,
  Loader2,
  AlertTriangle,
  Receipt,
  ExternalLink,
  Eye
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import FileViewer from "@/components/ui/file-viewer";
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
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { useObras } from "@/hooks/useObras";
import { calculateNotasMetrics, calculatePeriodTrend } from "@/lib/utils/metrics";

// Updated type definition to properly handle potential query errors
interface NotaFiscal {
  id: string;
  numero: string | null;
  obra_id: string;
  obras: {
    nome: string;
  };
  fornecedor_pj_id: string | null;
  fornecedor_pf_id: string | null;
  fornecedores_pj?: {
    razao_social: string;
  } | null;
  fornecedores_pf?: {
    nome: string;
  } | null;
  data_emissao: string;
  valor_total: number;
  arquivo_url: string | null;
  arquivo_path?: string | null;
  chave_acesso?: string | null;
  descricao?: string | null;
  despesa_id?: string | null;
  created_at?: string;
  updated_at?: string;
  usuario_upload_id?: string | null;
}

const NotasLista = () => {
  const navigate = useNavigate();
  const [notaToDelete, setNotaToDelete] = useState<string | null>(null);
  const [selectedObraId, setSelectedObraId] = useState<string>("all");
  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [fileViewerState, setFileViewerState] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }>({
    isOpen: false,
    fileUrl: "",
    fileName: "",
    fileType: ""
  });

  const { notasFiscais, isLoading, error, refetch, deleteNotaFiscal } = useNotasFiscais();
  const { obras } = useObras();

  // Cast the data to the proper type
  const notas = notasFiscais as unknown as NotaFiscal[];

  const filteredNotas = selectedObraId === "all" && notas
    ? notas
    : notas?.filter(nota => nota.obra_id === selectedObraId);

  // Calcular métricas reais usando a função utilitária
  const metrics = calculateNotasMetrics(notas || [], filteredNotas || []);
  
  // Calcular tendências baseadas em dados históricos reais
  const trendTotalNotas = calculatePeriodTrend(notas || [], 'valor_total', 'data_emissao');
  const trendNotasComArquivo = calculatePeriodTrend(
    notas?.filter(n => n.arquivo_url) || [], 
    'valor_total', 
    'data_emissao'
  );

  const handleDelete = async () => {
    if (!notaToDelete) return;

    try {
      await deleteNotaFiscal.mutateAsync(notaToDelete);
      setNotaToDelete(null);
    } catch (error) {
      console.error("Error deleting nota fiscal:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const notaId of selectedNotas) {
        await deleteNotaFiscal.mutateAsync(notaId);
      }
      setSelectedNotas([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting notas fiscais:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allNotaIds = filteredNotas?.map(nota => nota.id) || [];
      setSelectedNotas(allNotaIds);
    } else {
      setSelectedNotas([]);
    }
  };

  const handleSelectNota = (notaId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotas(prev => [...prev, notaId]);
    } else {
      setSelectedNotas(prev => prev.filter(id => id !== notaId));
    }
  };

  const getFornecedorName = (nota: NotaFiscal): string => {
    if (nota.fornecedores_pj && 'razao_social' in nota.fornecedores_pj) {
      return nota.fornecedores_pj.razao_social;
    }
    if (nota.fornecedores_pf && 'nome' in nota.fornecedores_pf) {
      return nota.fornecedores_pf.nome;
    }
    return "-";
  };

  const handleViewFile = (nota: NotaFiscal) => {
    if (!nota.arquivo_url) return;
    
    // Determinar tipo de arquivo pela extensão da URL
    const getFileType = (url: string): string => {
      const extension = url.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'application/pdf';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'xml':
          return 'text/xml';
        default:
          return 'application/pdf';
      }
    };

    const fileName = `Nota_Fiscal_${nota.numero || nota.id}.${nota.arquivo_url.split('.').pop()}`;
    
    setFileViewerState({
      isOpen: true,
      fileUrl: nota.arquivo_url,
      fileName,
      fileType: getFileType(nota.arquivo_url)
    });
  };

  const closeFileViewer = () => {
    setFileViewerState({
      isOpen: false,
      fileUrl: "",
      fileName: "",
      fileType: ""
    });
  };

  const columns: ColumnDef<NotaFiscal>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value);
          }}
          aria-label="Selecionar todas"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedNotas.includes(row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleSelectNota(row.original.id, !!value);
          }}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "numero",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.numero || "-"}
        </div>
      ),
    },
    {
      accessorKey: "obras.nome",
      header: "Obra",
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.obras?.nome || "-"}
        </div>
      ),
    },
    {
      id: "fornecedor",
      header: "Fornecedor",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {getFornecedorName(row.original)}
        </div>
      ),
    },
    {
      accessorKey: "data_emissao",
      header: "Data Emissão",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateBR(row.original.data_emissao)}
        </span>
      ),
    },
    {
      accessorKey: "valor_total",
      header: "Valor Total",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrencyBR(row.original.valor_total)}
        </span>
      ),
    },
    {
      id: "arquivo",
      header: "Arquivo",
      cell: ({ row }) => (
        row.original.arquivo_url ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewFile(row.original)}
              className="h-8 px-2 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              <Eye className="h-3 w-3 mr-1" />
              Visualizar
            </Button>
            <a
              href={row.original.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs transition-colors p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              title="Abrir em nova aba"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600">
            Sem arquivo
          </Badge>
        )
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
            onClick={() => navigate(`/dashboard/notas/editar/${row.original.id}`)}
            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            onClick={() => setNotaToDelete(row.original.id)}
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-500" />
            <p className="text-muted-foreground">Carregando notas fiscais...</p>
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
            <h3 className="text-lg font-semibold">Erro ao carregar notas fiscais</h3>
            <p className="text-muted-foreground">Não foi possível carregar a lista de notas fiscais.</p>
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
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 dark:bg-yellow-400/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notas Fiscais</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie todas as notas fiscais das obras
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            {selectedNotas.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Selecionados ({selectedNotas.length})
              </Button>
            )}
            <Button 
              asChild 
              className={cn(
                              "bg-gradient-to-r from-yellow-500 to-yellow-600",
              "hover:from-yellow-600 hover:to-yellow-700",
                "text-white shadow-lg",
                "transition-all duration-300"
              )}
            >
              <Link to="/dashboard/notas/enviar">
                <Plus className="h-4 w-4 mr-2" />
                Enviar Nota
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
            title="Total de Notas"
            value={metrics.totalNotas.toString()}
            icon={Receipt}
            trend={trendTotalNotas}
            iconColor="primary"
            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <MetricCard
            title="Valor Total"
            value={formatCurrencyBR(metrics.valorTotal)}
            icon={Receipt}
            trend={trendTotalNotas}
            iconColor="success"
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700"
          />
          <MetricCard
            title="Com Arquivo"
            value={metrics.notasComArquivo.toString()}
            icon={FileText}
            trend={trendNotasComArquivo}
            iconColor="info"
                          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          />
          <MetricCard
            title="Valor Médio"
            value={formatCurrencyBR(metrics.mediaValor)}
            icon={Receipt}
            trend={undefined}
            iconColor="warning"
                          className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
          />
        </motion.div>
        
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
                      <Card className="border-yellow-200/50 dark:border-yellow-700/50 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                                  <div className="h-8 w-8 rounded-lg bg-yellow-500/10 dark:bg-yellow-400/10 flex items-center justify-center">
                    <Filter className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <span className="text-yellow-700 dark:text-yellow-300">Filtros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                    Obra
                  </label>
                  <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors">
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
              <DataTable columns={columns} data={filteredNotas || []} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de confirmação de exclusão */}
        <AlertDialog open={!!notaToDelete} onOpenChange={() => setNotaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.
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
                Tem certeza de que deseja excluir {selectedNotas.length} nota(s) fiscal(is) selecionada(s)? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir {selectedNotas.length} nota(s)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Visualizador de arquivos */}
        <FileViewer
          isOpen={fileViewerState.isOpen}
          onClose={closeFileViewer}
          fileUrl={fileViewerState.fileUrl}
          fileName={fileViewerState.fileName}
          fileType={fileViewerState.fileType}
        />
      </motion.div>
    </DashboardLayout>
  );
};

export default NotasLista;
