import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Pencil, 
  Trash2, 
  User, 
  Plus, 
  Users,
  Building2,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/contexts/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fornecedoresPFApi } from "@/services/api";
import { t, formatDateBR } from "@/lib/i18n";

type FornecedorPF = {
  id: string;
  nome: string;
  cpf: string;
  tipo_fornecedor: string | null;
  email: string | null;
  telefone_principal: string | null;
  data_nascimento: string | null;
};

const FornecedoresPFLista = () => {
  const navigate = useNavigate();
  const [fornecedorToDelete, setFornecedorToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Obter tenant_id corretamente do usuário logado
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  const { data: fornecedores, isLoading, isError, refetch } = useQuery({
    queryKey: ["fornecedores_pf", validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPFApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
    retry: (failureCount, error) => {
      return failureCount < 1; // Máximo 1 tentativa
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fornecedoresPFApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["fornecedores_pf", validTenantId]);
      setFornecedorToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting fornecedor PF:", error);
    },
  });

  const handleDelete = async () => {
    if (!fornecedorToDelete) return;
    deleteMutation.mutate(fornecedorToDelete);
  };

  const columns: ColumnDef<FornecedorPF>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.nome}</div>
      ),
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{row.original.cpf}</span>
      ),
    },
    {
      accessorKey: "tipo_fornecedor",
      header: "Tipo",
      cell: ({ row }) => 
        row.original.tipo_fornecedor ? (
          <Badge variant="outline" className="text-xs bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">
            {row.original.tipo_fornecedor}
          </Badge>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">-</span>
        ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.email || "-"}
        </span>
      ),
    },
    {
      accessorKey: "telefone_principal",
      header: "Telefone",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
          {row.original.telefone_principal || "-"}
        </span>
      ),
    },
    {
      accessorKey: "data_nascimento",
      header: "Nascimento",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formatDateBR(row.original.data_nascimento)}
        </span>
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
            onClick={() => navigate(`/dashboard/fornecedores/pf/${row.original.id}/editar`)}
            className="h-8 w-8 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            onClick={() => setFornecedorToDelete(row.original.id)}
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
            <p className="text-muted-foreground">Carregando fornecedores...</p>
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
            <h3 className="text-lg font-semibold">Erro ao carregar fornecedores</h3>
            <p className="text-muted-foreground">Não foi possível carregar a lista de fornecedores.</p>
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
              <Users className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Fornecedores</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie fornecedores pessoa física e jurídica
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
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
              <Link to="/dashboard/fornecedores/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Tabs para alternar entre PF e PJ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="pf" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pf" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Pessoa Física
              </TabsTrigger>
              <TabsTrigger value="pj" asChild>
                <Link to="/dashboard/fornecedores/pj" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Pessoa Jurídica
                </Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pf">
              {/* Tabela */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
                <span className="text-green-700 dark:text-green-300">Fornecedores Pessoa Física</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable columns={columns} data={fornecedores || []} />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Modal de confirmação de exclusão */}
        <AlertDialog open={!!fornecedorToDelete} onOpenChange={() => setFornecedorToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
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

export default FornecedoresPFLista;
