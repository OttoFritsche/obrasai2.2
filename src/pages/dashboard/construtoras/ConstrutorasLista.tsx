import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [construtoras, setConstrutoras] = useState<{ id: string; nome: string; cnpj?: string; email?: string; telefone?: string; endereco?: string }[]>([]);
  const [loading, setLoading] = useState(true);

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
      (c.razao_social?.toLowerCase().includes(term) || "") +
      (c.nome_fantasia?.toLowerCase().includes(term) || "") +
      (c.nome?.toLowerCase().includes(term) || "") +
      (c.cnpj?.toLowerCase().includes(term) || "") +
      (c.cpf?.toLowerCase().includes(term) || "") +
      (c.telefone?.toLowerCase().includes(term) || "") +
      (c.cidade?.toLowerCase().includes(term) || "")
    ).includes(term);
  });

  // Excluir construtora (real)
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("construtoras").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir construtora");
    } else {
      setConstrutoras((prev) => prev.filter((c) => c.id !== id));
      toast.success("Construtora excluída com sucesso!");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Construtoras & Autônomos</h1>
        <Button onClick={() => navigate("/dashboard/construtoras/nova")}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Construtora
        </Button>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Buscar e Filtrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input
              placeholder="Buscar por nome, CNPJ, CPF, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
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
                {c.tipo === "pj" ? (
                  <Building2 className="h-5 w-5 text-blue-500" />
                ) : (
                  <User className="h-5 w-5 text-blue-500" />
                )}
                <div className="flex-1">
                  <div className="font-bold">
                    {c.tipo === "pj" ? c.razao_social : c.nome}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.tipo === "pj" ? c.cnpj : c.cpf}
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
    </DashboardLayout>
  );
};

export default ConstrutorasLista;