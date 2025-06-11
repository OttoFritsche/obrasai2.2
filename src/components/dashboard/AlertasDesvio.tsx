import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Eye, 
  Check, 
  X,
  Activity,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface AlertaDesvio {
  id: string;
  obra_id: string;
  obra_nome: string;
  tipo_alerta: string;
  severidade: string;
  titulo: string;
  descricao: string;
  valor_limite: number | null;
  valor_atual: number | null;
  percentual_desvio: number | null;
  status: string;
  data_criacao: string;
  data_resolucao: string | null;
  resolvido_por: string | null;
  observacoes: string | null;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  obras?: {
    nome: string;
  };
}

interface ConfiguracaoAlerta {
  id: string;
  tipo: 'orcamento' | 'prazo' | 'qualidade';
  limite_percentual: number;
  ativo: boolean;
}

interface ResumoAlertas {
  total: number;
  ativos: number;
  baixa: number;
  media: number;
  alta: number;
  critica: number;
}

const AlertasDesvio: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaDesvio[]>([]);
  const [resumo, setResumo] = useState<ResumoAlertas>({
    total: 0,
    ativos: 0,
    baixa: 0,
    media: 0,
    alta: 0,
    critica: 0
  });
  const [loading, setLoading] = useState(true);
  const [calculandoDesvios, setCalculandoDesvios] = useState(false);
  const { toast } = useToast();

  const carregarAlertas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alertas_desvio')
        .select(`
          *,
          obras!inner(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alertasFormatados = data?.map(alerta => ({
        ...alerta,
        obra_nome: alerta.obras?.nome || 'Obra não encontrada'
      })) || [];

      setAlertas(alertasFormatados);

      // Calcular resumo
      const novoResumo = alertasFormatados.reduce((acc, alerta) => {
        acc.total++;
        if (alerta.status === 'ativo') acc.ativos++;
        // Mapear severidade para as categorias do resumo
        if (alerta.severidade === 'baixa') acc.baixa++;
        else if (alerta.severidade === 'media') acc.media++;
        else if (alerta.severidade === 'alta') acc.alta++;
        else if (alerta.severidade === 'critica') acc.critica++;
        return acc;
      }, {
        total: 0,
        ativos: 0,
        baixa: 0,
        media: 0,
        alta: 0,
        critica: 0
      });

      setResumo(novoResumo);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularDesviosTodasObras = async () => {
    try {
      setCalculandoDesvios(true);
      
      const { data, error } = await supabase.functions.invoke('calcular-desvios-obras', {
        body: { recalcular_todos: true }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Desvios calculados com sucesso!",
      });

      // Recarregar alertas após o cálculo
      await carregarAlertas();
    } catch (error) {
      console.error('Erro ao calcular desvios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível calcular os desvios.",
        variant: "destructive",
      });
    } finally {
      setCalculandoDesvios(false);
    }
  };

  const atualizarStatusAlerta = async (alertaId: string, novoStatus: AlertaDesvio['status']) => {
    try {
      const { error } = await supabase
        .from('alertas_desvio')
        .update({ 
          status: novoStatus,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', alertaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do alerta atualizado!",
      });

      // Recarregar alertas
      await carregarAlertas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do alerta.",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'destructive';
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baixa': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <AlertTriangle className="h-4 w-4" />;
      case 'visto': return <Eye className="h-4 w-4" />;
      case 'resolvido': return <Check className="h-4 w-4" />;
      case 'ignorado': return <X className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Alertas de Desvio</h1>
          <p className="text-muted-foreground">
            Monitore desvios orçamentários e tome ações preventivas
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={calcularDesviosTodasObras}
            disabled={calculandoDesvios}
            className={cn(
              "bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200",
              "hover:shadow-md active:scale-95",
              calculandoDesvios && "opacity-70 cursor-not-allowed"
            )}
          >
            {calculandoDesvios ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              'Calcular Desvios'
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dashboard/alertas-avancados'}
            className={cn(
              "border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950",
              "transition-all duration-200 hover:shadow-sm active:scale-95"
            )}
          >
            <Bell className="h-4 w-4 mr-2" />
            Alertas Avançados
          </Button>
          <Button 
            variant="outline" 
            onClick={carregarAlertas}
            className={cn(
              "border-border text-foreground hover:bg-accent",
              "transition-all duration-200 hover:shadow-sm active:scale-95"
            )}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card className={cn(
          "transition-all duration-200 hover:shadow-md border-border",
          "hover:scale-105 cursor-pointer group"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Total
                </p>
                <p className="text-2xl font-bold text-foreground">{resumo.total}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all duration-200 hover:shadow-md border-border",
          "hover:scale-105 cursor-pointer group",
          resumo.ativos > 0 && "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  Ativos
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{resumo.ativos}</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all duration-200 hover:shadow-md border-border",
          "hover:scale-105 cursor-pointer group"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  Baixo
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resumo.baixa}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all duration-200 hover:shadow-md border-border",
          "hover:scale-105 cursor-pointer group"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors">
                  Médio
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{resumo.media}</p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all duration-200 hover:shadow-md border-border",
          "hover:scale-105 cursor-pointer group"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                  Alto
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{resumo.alta}</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all duration-200 hover:shadow-md border-border",
          "hover:scale-105 cursor-pointer group"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  Crítico
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{resumo.critica}</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Alertas */}
      <Tabs defaultValue="ativos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger 
            value="ativos"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
          >
            Alertas Ativos ({resumo.ativos})
          </TabsTrigger>
          <TabsTrigger 
            value="todos"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
          >
            Todos os Alertas ({resumo.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="space-y-4">
          {alertas.filter(alerta => alerta.status === 'ativo').length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum alerta ativo</h3>
              <p className="text-muted-foreground">Todas as obras estão dentro dos parâmetros esperados.</p>
            </div>
          ) : (
            alertas.filter(alerta => alerta.status === 'ativo').map(alerta => (
              <Card key={alerta.id} className={`border-l-4 ${
                alerta.severidade === 'critica' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' :
                alerta.severidade === 'alta' ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20' :
                alerta.severidade === 'media' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' :
                'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
              } transition-all duration-200 hover:shadow-md`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-foreground">{alerta.obra_nome}</h3>
                        <Badge variant={getBadgeVariant(alerta.severidade)} className="capitalize">
                          {alerta.severidade}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alerta.tipo_alerta}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{alerta.descricao}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {alerta.percentual_desvio > 0 ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          <span className={`font-semibold ${
                            alerta.percentual_desvio > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {alerta.percentual_desvio > 0 ? '+' : ''}{alerta.percentual_desvio.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          Desvio: {formatCurrency(Math.abs(alerta.valor_atual - alerta.valor_limite))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => atualizarStatusAlerta(alerta.id, 'visto')}
                        className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Marcar como Visto
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => atualizarStatusAlerta(alerta.id, 'resolvido')}
                        className="hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => atualizarStatusAlerta(alerta.id, 'ignorado')}
                        className="hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Ignorar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4">
          {alertas.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">Execute o cálculo de desvios para gerar alertas.</p>
            </div>
          ) : (
            alertas.map(alerta => (
              <Card key={alerta.id} className={`border-l-4 ${
                alerta.severidade === 'critica' ? 'border-l-red-500' :
                alerta.severidade === 'alta' ? 'border-l-orange-500' :
                alerta.severidade === 'media' ? 'border-l-yellow-500' :
                'border-l-green-500'
              } transition-all duration-200 hover:shadow-md ${
                alerta.status !== 'ativo' ? 'opacity-60' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-foreground">{alerta.obra_nome}</h3>
                        <Badge variant={getBadgeVariant(alerta.severidade)} className="capitalize">
                          {alerta.severidade}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alerta.tipo_alerta}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(alerta.status)}
                          <span className="text-sm text-muted-foreground capitalize">{alerta.status}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{alerta.descricao}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {alerta.percentual_desvio > 0 ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          <span className={`font-semibold ${
                            alerta.percentual_desvio > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {alerta.percentual_desvio > 0 ? '+' : ''}{alerta.percentual_desvio.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          Desvio: {formatCurrency(Math.abs(alerta.valor_atual - alerta.valor_limite))}
                        </div>
                      </div>
                    </div>
                    {alerta.status === 'ativo' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarStatusAlerta(alerta.id, 'visto')}
                          className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Marcar como Visto
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarStatusAlerta(alerta.id, 'resolvido')}
                          className="hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarStatusAlerta(alerta.id, 'ignorado')}
                          className="hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Ignorar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertasDesvio;