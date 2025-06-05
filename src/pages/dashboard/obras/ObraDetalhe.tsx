import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building, 
  Pencil, 
  Clock, 
  Calendar, 
  DollarSign, 
  MapPin, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Brain,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";
import { obrasApi } from "@/services/api";

import InsightsObra from "@/components/ai/InsightsObra";
import InterfaceChat from "@/components/ai/InterfaceChat";

const ObraDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("detalhes");
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);

  const { data: obra, isLoading, isError } = useQuery({
    queryKey: ["obra", id],
    queryFn: () => obrasApi.getById(id!),
    enabled: !!id,
  });

  const tabs = [
    { id: "detalhes", label: "Detalhes", icon: Building, color: "text-blue-500" },
    { id: "insights", label: "Insights IA", icon: TrendingUp, color: "text-purple-500" },
    { id: "chat", label: "Chat IA", icon: MessageSquare, color: "text-green-500" },
  ];

  const handleGenerateEmbeddings = async () => {
    if (!obra) return;
    
    setIsGeneratingEmbeddings(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gerar-embeddings-obra', {
        body: {
          obra_id: obra.id,
          tipo_conteudo: 'todos'
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Conhecimento da IA atualizado!",
        description: `${data.embeddings_gerados} embeddings gerados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar embeddings:', error);
      toast({
        title: "❌ Erro ao atualizar IA",
        description: "Não foi possível atualizar o conhecimento da IA.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
            <p className="text-muted-foreground">Carregando detalhes da obra...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (isError || !obra) {
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
            <h3 className="text-lg font-semibold">Erro ao carregar obra</h3>
            <p className="text-muted-foreground">Não foi possível encontrar os dados da obra solicitada.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/obras")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard/obras")}
              className="hover:bg-purple-500/10 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{obra.nome}</h1>
                <p className="text-sm text-muted-foreground">
                  {obra.cidade}, {obra.estado}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              onClick={handleGenerateEmbeddings}
              disabled={isGeneratingEmbeddings}
              className="group hover:border-purple-500/50"
            >
              {isGeneratingEmbeddings ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando IA...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-1 transition-colors group-hover:text-purple-500" />
                  <Sparkles className="h-3 w-3 mr-2 transition-colors group-hover:text-purple-500" />
                  Atualizar IA
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/dashboard/obras/${id}/editar`)}
              className="group hover:border-purple-500/50"
            >
              <Pencil className="h-4 w-4 mr-2 transition-colors group-hover:text-purple-500" />
              Editar Obra
            </Button>
          </motion.div>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Em Andamento
          </Badge>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <Icon className={cn("h-4 w-4", tab.color)} />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="detalhes" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-500" />
                        </div>
                        Informações de Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3">
                        <div className="flex justify-between items-start">
                          <dt className="text-sm text-muted-foreground">Endereço</dt>
                          <dd className="text-right max-w-[60%] font-medium">{obra.endereco}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground">Cidade</dt>
                          <dd className="font-medium">{obra.cidade}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground">Estado</dt>
                          <dd className="font-medium">{obra.estado}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground">CEP</dt>
                          <dd className="font-mono text-sm">{obra.cep}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-orange-500" />
                        </div>
                        Cronograma e Orçamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3">
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Data de Início
                          </dt>
                          <dd className="font-medium">{formatDateBR(obra.data_inicio)}</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Previsão de Término
                          </dt>
                          <dd className="font-medium">{formatDateBR(obra.data_prevista_termino)}</dd>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <dt className="text-sm text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            Orçamento Total
                          </dt>
                          <dd className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrencyBR(obra.orcamento)}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Cards de métricas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <p className="text-xl font-bold">35%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gastos</p>
                        <p className="text-xl font-bold">R$ 45k</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dias Restantes</p>
                        <p className="text-xl font-bold">127</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="insights" className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InsightsObra obraId={id!} />
              </motion.div>
            </TabsContent>

            <TabsContent value="chat" className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InterfaceChat obraId={id!} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ObraDetalhe;
