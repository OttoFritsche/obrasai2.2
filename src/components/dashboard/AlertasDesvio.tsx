import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Eye, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Bell,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';

interface AlertaDesvio {
  id: string;
  obra_id: string;
  tipo_alerta: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  percentual_desvio: number;
  valor_orcado: number;
  valor_realizado: number;
  valor_desvio: number;
  categoria?: string;
  etapa?: string;
  descricao: string;
  status: 'ATIVO' | 'VISUALIZADO' | 'RESOLVIDO' | 'IGNORADO';
  created_at: string;
  obras?: {
    nome: string;
  };
}

interface ConfiguracaoAlerta {
  id?: string;
  obra_id: string;
  threshold_baixo: number;
  threshold_medio: number;
  threshold_alto: number;
  notificar_email: boolean;
  notificar_dashboard: boolean;
  ativo: boolean;
}

interface ResumoAlertas {
  total: number;
  ativos: number;
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
}

const AlertasDesvio: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaDesvio[]>([]);
  const [resumo, setResumo] = useState<ResumoAlertas>({
    total: 0,
    ativos: 0,
    baixo: 0,
    medio: 0,
    alto: 0,
    critico: 0
  });
  const [loading, setLoading] = useState(true);
  const [calculandoDesvios, setCalculandoDesvios] = useState(false);
  const { toast } = useToast();

  const carregarAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('alertas_desvio')
        .select(`
          *,
          obras:obra_id (
            nome
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAlertas(data || []);
      
      // Calcular resumo
      const alertasAtivos = data?.filter(a => a.status === 'ATIVO') || [];
      const novoResumo: ResumoAlertas = {
        total: data?.length || 0,
        ativos: alertasAtivos.length,
        baixo: alertasAtivos.filter(a => a.tipo_alerta === 'BAIXO').length,
        medio: alertasAtivos.filter(a => a.tipo_alerta === 'MEDIO').length,
        alto: alertasAtivos.filter(a => a.tipo_alerta === 'ALTO').length,
        critico: alertasAtivos.filter(a => a.tipo_alerta === 'CRITICO').length
      };
      
      setResumo(novoResumo);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularDesviosTodasObras = async () => {
    setCalculandoDesvios(true);
    try {
      // Buscar todas as obras (o status será calculado no frontend)
      const { data: obras, error: obrasError } = await supabase
        .from('obras')
        .select('id, tenant_id, nome, data_inicio, data_prevista_termino');

      if (obrasError) throw obrasError;

      // Filtrar obras ativas baseado nas datas (mesmo critério do getObraStatus)
      const obrasAtivas = obras?.filter(obra => {
        const hoje = new Date();
        const dataInicio = obra.data_inicio ? new Date(obra.data_inicio) : null;
        
        // Incluir obras que já iniciaram ou estão planejadas para iniciar
        return dataInicio && dataInicio <= hoje;
      }) || [];

      if (!obrasAtivas || obrasAtivas.length === 0) {
        toast({
          title: "Informação",
          description: "Nenhuma obra ativa encontrada para calcular desvios.",
        });
        return;
      }

      // Chamar a Edge Function para cada obra
      let sucessos = 0;
      let erros = 0;

      for (const obra of obrasAtivas) {
        try {
          const { data, error } = await supabase.functions.invoke('calculate-budget-deviation', {
            body: {
              obra_id: obra.id,
              tenant_id: obra.tenant_id,
              trigger_type: 'manual'
            }
          });

          if (error) throw error;
          if (data?.success) {
            sucessos++;
          } else {
            erros++;
          }
        } catch (error) {
          console.error(`Erro ao calcular desvio para obra ${obra.id}:`, error);
          erros++;
        }
      }

      toast({
        title: "Cálculo Concluído",
        description: `${sucessos} obras processadas com sucesso. ${erros > 0 ? `${erros} erros encontrados.` : ''}`,
        variant: sucessos > 0 ? "default" : "destructive"
      });

      // Recarregar alertas
      await carregarAlertas();
    } catch (error) {
      console.error('Erro ao calcular desvios:', error);
      toast({
        title: "Erro",
        description: "Erro ao calcular desvios orçamentários.",
        variant: "destructive"
      });
    } finally {
      setCalculandoDesvios(false);
    }
  };

  const atualizarStatusAlerta = async (alertaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('alertas_desvio')
        .update({ status: novoStatus })
        .eq('id', alertaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do alerta atualizado.",
      });

      await carregarAlertas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do alerta.",
        variant: "destructive"
      });
    }
  };

  const getTipoAlertaBadge = (tipo: string) => {
    const configs = {
      BAIXO: { variant: 'secondary' as const, color: 'text-yellow-600' },
      MEDIO: { variant: 'default' as const, color: 'text-orange-600' },
      ALTO: { variant: 'destructive' as const, color: 'text-red-600' },
      CRITICO: { variant: 'destructive' as const, color: 'text-red-800' }
    };
    
    return configs[tipo as keyof typeof configs] || configs.BAIXO;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'VISUALIZADO': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'RESOLVIDO': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IGNORADO': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas de Desvio Orçamentário</h1>
          <p className="text-gray-600 mt-1">Monitore desvios e mantenha o controle financeiro das obras</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={calcularDesviosTodasObras}
            disabled={calculandoDesvios}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {calculandoDesvios ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {calculandoDesvios ? 'Calculando...' : 'Calcular Desvios'}
          </Button>
          <Button variant="outline" onClick={carregarAlertas}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{resumo.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-red-600">{resumo.ativos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Baixo</p>
                <p className="text-2xl font-bold">{resumo.baixo}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Médio</p>
                <p className="text-2xl font-bold">{resumo.medio}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Alto</p>
                <p className="text-2xl font-bold">{resumo.alto}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Crítico</p>
                <p className="text-2xl font-bold">{resumo.critico}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <Tabs defaultValue="ativos" className="w-full">
        <TabsList>
          <TabsTrigger value="ativos">Alertas Ativos ({resumo.ativos})</TabsTrigger>
          <TabsTrigger value="todos">Todos os Alertas ({resumo.total})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ativos" className="space-y-4">
          {alertas.filter(a => a.status === 'ATIVO').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum alerta ativo</h3>
                <p className="text-gray-600">Todas as obras estão dentro dos parâmetros orçamentários configurados.</p>
              </CardContent>
            </Card>
          ) : (
            alertas.filter(a => a.status === 'ATIVO').map((alerta) => (
              <Card key={alerta.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(alerta.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {alerta.obras?.nome || 'Obra não identificada'}
                          {alerta.categoria && (
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              • {alerta.categoria}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{alerta.descricao}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge {...getTipoAlertaBadge(alerta.tipo_alerta)}>
                        {alerta.tipo_alerta}
                      </Badge>
                      <Badge variant="outline">
                        {alerta.percentual_desvio > 0 ? '+' : ''}{alerta.percentual_desvio.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Orçado</p>
                      <p className="font-semibold">{formatCurrency(alerta.valor_orcado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Realizado</p>
                      <p className="font-semibold">{formatCurrency(alerta.valor_realizado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Desvio</p>
                      <p className={`font-semibold ${
                        alerta.valor_desvio > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {alerta.valor_desvio > 0 ? '+' : ''}{formatCurrency(alerta.valor_desvio)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => atualizarStatusAlerta(alerta.id, 'VISUALIZADO')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Marcar como Visto
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => atualizarStatusAlerta(alerta.id, 'RESOLVIDO')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => atualizarStatusAlerta(alerta.id, 'IGNORADO')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Ignorar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="todos" className="space-y-4">
          {alertas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum alerta encontrado</h3>
                <p className="text-gray-600">Execute o cálculo de desvios para gerar alertas.</p>
              </CardContent>
            </Card>
          ) : (
            alertas.map((alerta) => (
              <Card key={alerta.id} className={`border-l-4 ${
                alerta.status === 'ATIVO' ? 'border-l-red-500' : 
                alerta.status === 'RESOLVIDO' ? 'border-l-green-500' : 'border-l-gray-300'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(alerta.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {alerta.obras?.nome || 'Obra não identificada'}
                          {alerta.categoria && (
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              • {alerta.categoria}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {alerta.descricao} • {new Date(alerta.created_at).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{alerta.status}</Badge>
                      <Badge {...getTipoAlertaBadge(alerta.tipo_alerta)}>
                        {alerta.tipo_alerta}
                      </Badge>
                      <Badge variant="outline">
                        {alerta.percentual_desvio > 0 ? '+' : ''}{alerta.percentual_desvio.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Orçado</p>
                      <p className="font-semibold">{formatCurrency(alerta.valor_orcado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Realizado</p>
                      <p className="font-semibold">{formatCurrency(alerta.valor_realizado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Desvio</p>
                      <p className={`font-semibold ${
                        alerta.valor_desvio > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {alerta.valor_desvio > 0 ? '+' : ''}{formatCurrency(alerta.valor_desvio)}
                      </p>
                    </div>
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