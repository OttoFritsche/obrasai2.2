import type { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { 
  AlertTriangle,
  Building2,
  Loader2,
  Pencil, 
  Plus, 
  Trash2, 
  User,
  Users} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layouts/DashboardLayout";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFornecedoresPJ } from "@/hooks/useFornecedoresPJ";
import { cn } from "@/lib/utils";

interface FornecedorPJ {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  email: string | null;
  telefone_principal: string | null;
}

const FornecedoresPJLista = () => {
  const navigate = useNavigate();
  const [fornecedorToDelete, setFornecedorToDelete] = useState<string | null>(null);
  const [selectedFornecedores, setSelectedFornecedores] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { fornecedoresPJ, isLoading, error, refetch, deleteFornecedorPJ } = useFornecedoresPJ();

  const handleDelete = async () => {
    if (!fornecedorToDelete) return;

    try {
      await deleteFornecedorPJ.mutateAsync(fornecedorToDelete);
      setFornecedorToDelete(null);
    } catch (_error) {
      console.error("Error deleting fornecedor PJ:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFornecedores.length === 0) return;
    
    try {
      for (const id of selectedFornecedores) {
        await deleteFornecedorPJ.mutateAsync(id);
      }
      setSelectedFornecedores([]);
      setShowBulkDeleteDialog(false);
    } catch (_error) {
      console.error("Error deleting fornecedores:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFornecedores(fornecedoresPJ?.map(f => f.id) || []);
    } else {
      setSelectedFornecedores([]);
    }
  };

  const handleSelectFornecedor = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFornecedores(prev => [...prev, id]);
    } else {
      setSelectedFornecedores(prev => prev.filter(fId => fId !== id));
    }
  };

  const columns: ColumnDef<FornecedorPJ>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedFornecedores.length === fornecedoresPJ?.length && fornecedoresPJ?.length > 0}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedFornecedores.includes(row.original.id)}
          onCheckedChange={(checked) => handleSelectFornecedor(row.original.id, !!checked)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "razao_social",
      header: "Razão Social",
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.razao_social}</div>
      ),
    },
    {
      accessorKey: "nome_fantasia",
      header: "Nome Fantasia",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.nome_fantasia || "-"}
        </span>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{row.original.cnpj}</span>
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
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => navigate(`/dashboard/fornecedores/pj/${row.original.id}/editar`)}
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

        {/* Botão de exclusão em massa */}
        {selectedFornecedores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {selectedFornecedores.length} fornecedor(es) selecionado(s)
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Selecionados
            </Button>
          </motion.div>
        )}

        {/* Tabs para alternar entre PF e PJ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="pj" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pf" asChild>
                <Link to="/dashboard/fornecedores/pf" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Pessoa Física
                </Link>
              </TabsTrigger>
              <TabsTrigger value="pj" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Pessoa Jurídica
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pj">
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
                  <Building2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
                <span className="text-green-700 dark:text-green-300">Fornecedores Pessoa Jurídica</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable columns={columns} data={fornecedoresPJ || []} />
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

        {/* Modal de confirmação de exclusão em massa */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir {selectedFornecedores.length} fornecedor(es) selecionado(s)? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir Todos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default FornecedoresPJLista;
