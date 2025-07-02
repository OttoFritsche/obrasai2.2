import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Edit, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

const ConstrutorasLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenantId = user?.profile?.tenant_id;
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [construtoras, setConstrutoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConstrutoras, setSelectedConstrutoras] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Fetch real das construtoras
  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    supabase
      .from("construtoras")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Erro ao buscar construtoras");
          setConstrutoras([]);
        } else {
          setConstrutoras(data || []);
        }
        setLoading(false);
      });
  }, [tenantId]);

  // Filtro por tipo
  const filtered = construtoras.filter((c) => {
    if (tab === "all") return true;
    return c.tipo === tab;
  }).filter((c) => {
    const term = search.toLowerCase();
    return (
      c.nome_razao_social?.toLowerCase().includes(term) ||
      c.nome_fantasia?.toLowerCase().includes(term) ||
      c.documento?.toLowerCase().includes(term) ||
      c.telefone?.toLowerCase().includes(term) ||
      c.cidade?.toLowerCase().includes(term)
    );
  });

  // Excluir construtora (real)
  const handleDelete = async (id: string) => {
    try {
      // Primeiro, verificar se há obras associadas a esta construtora
      const { data: obrasAssociadas, error: errorObras } = await supabase
        .from("obras")
        .select("id, nome")
        .eq("construtora_id", id)
        .limit(1);

      if (errorObras) {
        toast.error("Erro ao verificar obras associadas");
        return;
      }

      if (obrasAssociadas && obrasAssociadas.length > 0) {
        toast.error(
          "Não é possível excluir esta construtora pois existem obras associadas a ela. Remova ou transfira as obras primeiro."
        );
        return;
      }

      // Se não há obras associadas, proceder com a exclusão
      const { error } = await supabase.from("construtoras").delete().eq("id", id);
      
      if (error) {
        console.error("Erro ao excluir construtora:", error);
        toast.error("Erro ao excluir construtora: " + error.message);
      } else {
        setConstrutoras((prev) => prev.filter((c) => c.id !== id));
        toast.success("Construtora excluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao excluir construtora");
    }
  };

  // Exclusão em lote
  const handleBulkDelete = async () => {
    try {
      // Verificar se há obras associadas a qualquer uma das construtoras selecionadas
      const { data: obrasAssociadas, error: errorObras } = await supabase
        .from("obras")
        .select("id, nome, construtora_id")
        .in("construtora_id", selectedConstrutoras)
        .limit(1);

      if (errorObras) {
        toast.error("Erro ao verificar obras associadas");
        return;
      }

      if (obrasAssociadas && obrasAssociadas.length > 0) {
        toast.error(
          "Não é possível excluir as construtoras selecionadas pois existem obras associadas a elas. Remova ou transfira as obras primeiro."
        );
        return;
      }

      // Se não há obras associadas, proceder com a exclusão
      const { error } = await supabase
        .from("construtoras")
        .delete()
        .in("id", selectedConstrutoras);

      if (error) {
        console.error("Erro ao excluir construtoras:", error);
        toast.error("Erro ao excluir construtoras: " + error.message);
      } else {
        setConstrutoras((prev) => 
          prev.filter((c) => !selectedConstrutoras.includes(c.id))
        );
        setSelectedConstrutoras([]);
        setShowBulkDeleteDialog(false);
        toast.success(`${selectedConstrutoras.length} construtora(s) excluída(s) com sucesso!`);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao excluir construtoras");
    }
  };

  // Selecionar/deselecionar todas as construtoras
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedConstrutoras(filtered.map((c) => c.id));
    } else {
      setSelectedConstrutoras([]);
    }
  };

  // Selecionar/deselecionar construtora individual
  const handleSelectConstrutora = (construtoraId: string, checked: boolean) => {
    if (checked) {
      setSelectedConstrutoras((prev) => [...prev, construtoraId]);
    } else {
      setSelectedConstrutoras((prev) => prev.filter((id) => id !== construtoraId));
    }
  };

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
              <Building2 className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Construtoras & Autônomos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie construtoras e profissionais autônomos
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            {selectedConstrutoras.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="shadow-lg transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir {selectedConstrutoras.length} selecionada(s)
              </Button>
            )}
            <Button onClick={() => navigate("/dashboard/construtoras/nova")}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" /> Nova Construtora
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Buscar e Filtrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedConstrutoras.length === filtered.length && filtered.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Selecionar todos
                </label>
              </div>
              <Input
                placeholder="Buscar por nome, CNPJ, CPF, cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Tabs value={tab} onValueChange={setTab} className="ml-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pj">PJ</TabsTrigger>
                <TabsTrigger value="pf">PF</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              Nenhuma construtora encontrada.
            </div>
          )}
          {filtered.map((c) => (
            <Card key={c.id} className="relative group border-blue-200/50 dark:border-blue-700/50">
              <CardHeader className="flex flex-row items-center gap-2">
                <Checkbox
                  checked={selectedConstrutoras.includes(c.id)}
                  onCheckedChange={(checked) => handleSelectConstrutora(c.id, checked as boolean)}
                />
                {c.tipo === "pj" ? (
                  <Building2 className="h-5 w-5 text-blue-500" />
                ) : (
                  <User className="h-5 w-5 text-blue-500" />
                )}
                <div className="flex-1">
                  <div className="font-bold">
                    {c.nome_razao_social}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.documento}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/dashboard/construtoras/${c.id}/editar`)}
                  className="opacity-70 group-hover:opacity-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(c.id)}
                  className="opacity-70 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="font-medium">Telefone:</span> {c.telefone || "-"}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Cidade:</span> {c.cidade || "-"} / {c.estado || "-"}
                  </div>
                  {c.tipo === "pj" && (
                    <div className="mb-1">
                      <span className="font-medium">Nome Fantasia:</span> {c.nome_fantasia || "-"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal de confirmação para exclusão em lote */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Lote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedConstrutoras.length} construtora(s) selecionada(s)?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ConstrutorasLista;