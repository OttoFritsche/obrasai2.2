import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Trash2, 
  FileText, 
  Plus, 
  Download,
  Filter,
  Loader2,
  AlertTriangle,
  Receipt,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
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
import { notasFiscaisApi, obrasApi } from "@/services/api";
import { t, formatCurrencyBR, formatDateBR } from "@/lib/i18n";

// Updated type definition to properly handle potential query errors
type NotaFiscal = {
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
};

const NotasLista = () => {
  const navigate = useNavigate();
  const [notaToDelete, setNotaToDelete] = useState<string | null>(null);
  const [selectedObraId, setSelectedObraId] = useState<string>("all");

  const { data: notasData, isLoading, isError, refetch } = useQuery({
    queryKey: ["notas_fiscais"],
    queryFn: notasFiscaisApi.getAll,
  });

  const { data: obras } = useQuery({
    queryKey: ["obras"],
    queryFn: obrasApi.getAll,
  });

  // Cast the data to the proper type
  const notas = notasData as unknown as NotaFiscal[];

  const filteredNotas = selectedObraId === "all" && notas
    ? notas
    : notas?.filter(nota => nota.obra_id === selectedObraId);

  // Calcular métricas
  const totalNotas = filteredNotas?.length || 0;
  const valorTotal = filteredNotas?.reduce((sum, nota) => sum + nota.valor_total, 0) || 0;
  const notasComArquivo = filteredNotas?.filter(n => n.arquivo_url).length || 0;
  const mediaValor = totalNotas > 0 ? valorTotal / totalNotas : 0;

  const handleDelete = async () => {
    if (!notaToDelete) return;

    try {
      await notasFiscaisApi.delete(notaToDelete);
      refetch();
      setNotaToDelete(null);
    } catch (error) {
      console.error("Error deleting nota fiscal:", error);
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

  const columns: ColumnDef<NotaFiscal>[] = [
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
        <span className="font-mono font-medium">
          {formatCurrencyBR(row.original.valor_total)}
        </span>
      ),
    },
    {
      id: "arquivo",
      header: "Arquivo",
      cell: ({ row }) => (
        row.original.arquivo_url ? (
          <a
            href={row.original.arquivo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 text-sm"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visualizar
          </a>
        ) : (
          <Badge variant="outline" className="text-xs">
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
            title="Excluir"
            onClick={() => setNotaToDelete(row.original.id)}
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="text-muted-foreground">Carregando notas fiscais...</p>
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
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 dark:bg-orange-400/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-orange-500 dark:text-orange-400" />
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
          >
            <Button 
              asChild 
              className={cn(
                "bg-gradient-to-r from-orange-500 to-orange-600",
                "hover:from-orange-600 hover:to-orange-700",
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

        {/* Cards de métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Total de Notas"
            value={totalNotas.toString()}
            icon={Receipt}
            trend={{ value: 8, isUpward: true }}
            color="blue"
          />
          <MetricCard
            title="Valor Total"
            value={formatCurrencyBR(valorTotal)}
            icon={Receipt}
            trend={{ value: 12, isUpward: true }}
            color="green"
          />
          <MetricCard
            title="Com Arquivo"
            value={notasComArquivo.toString()}
            icon={FileText}
            trend={{ value: 15, isUpward: true }}
            color="purple"
          />
          <MetricCard
            title="Valor Médio"
            value={formatCurrencyBR(mediaValor)}
            icon={Receipt}
            trend={{ value: 3, isUpward: false }}
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
      </motion.div>
    </DashboardLayout>
  );
};

export default NotasLista;
