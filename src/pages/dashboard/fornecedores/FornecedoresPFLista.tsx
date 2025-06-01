import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { data: fornecedores, isLoading, isError, refetch } = useQuery({
    queryKey: ["fornecedores_pf"],
    queryFn: fornecedoresPFApi.getAll,
  });

  const handleDelete = async () => {
    if (!fornecedorToDelete) return;

    try {
      await fornecedoresPFApi.delete(fornecedorToDelete);
      refetch();
      setFornecedorToDelete(null);
    } catch (error) {
      console.error("Error deleting fornecedor PF:", error);
    }
  };

  const columns: ColumnDef<FornecedorPF>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.nome}</div>
      ),
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.cpf}</span>
      ),
    },
    {
      accessorKey: "tipo_fornecedor",
      header: "Tipo",
      cell: ({ row }) => 
        row.original.tipo_fornecedor ? (
          <Badge variant="outline" className="text-xs">
            {row.original.tipo_fornecedor}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.email || "-"}
        </span>
      ),
    },
    {
      accessorKey: "telefone_principal",
      header: "Telefone",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.telefone_principal || "-"}
        </span>
      ),
    },
    {
      accessorKey: "data_nascimento",
      header: "Nascimento",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
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
            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            onClick={() => setFornecedorToDelete(row.original.id)}
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
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
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 dark:bg-pink-400/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-pink-500 dark:text-pink-400" />
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
                "bg-gradient-to-r from-pink-500 to-pink-600",
                "hover:from-pink-600 hover:to-pink-700",
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
              {/* Estatísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
              >
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total PF</p>
                        <p className="text-xl font-bold">{fornecedores?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Com Email</p>
                        <p className="text-xl font-bold">
                          {fornecedores?.filter(f => f.email).length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Com Telefone</p>
                        <p className="text-xl font-bold">
                          {fornecedores?.filter(f => f.telefone_principal).length || 0}
                        </p>
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
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-pink-500" />
                      Fornecedores Pessoa Física
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
