import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Activity,
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock,
  Eye,
  Mail,
  RefreshCw,
  Settings, 
  TrendingUp, 
  Webhook,
  XCircle} from 'lucide-react';
import React, { useEffect,useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedAlerts } from '@/hooks/useAdvancedAlerts';
import { formatCurrency } from '@/lib/formatters';

import { ConfiguracaoAlertasAvancadas } from './ConfiguracaoAlertasAvancadas';
import { HistoricoAlertas } from './HistoricoAlertas';
import { NotificacoesAlertas } from './NotificacoesAlertas';

interface DashboardAlertasAvancadosProps {
  obraId?: string;
  className?: string;
  mostrarConfiguracoes?: boolean;
  onFecharConfiguracoes?: () => void;
}

export const DashboardAlertasAvancados: React.FC<DashboardAlertasAvancadosProps> = ({
  obraId,
  className = '',
  mostrarConfiguracoes: mostrarConfiguracoesExterno,
  onFecharConfiguracoes
}) => {
  const {
    configuracoes,
    notificacoes,
    historico,
    resumoNotificacoes,
    loading,
    processando,
    carregarConfiguracoes,
    carregarNotificacoes,
    carregarHistorico,
    marcarNotificacaoLida,
    processarAlertasObra,
    enviarNotificacoesPendentes
  } = useAdvancedAlerts();

  const [tabAtiva, setTabAtiva] = useState('dashboard');
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  
  // Usar estado externo se fornecido
  const configuracoesVisivel = mostrarConfiguracoesExterno !== undefined ? mostrarConfiguracoesExterno : mostrarConfiguracoes;
  const fecharConfiguracoes = onFecharConfiguracoes || (() => setMostrarConfiguracoes(false));

  useEffect(() => {
    carregarConfiguracoes(obraId);
    carregarNotificacoes();
    carregarHistorico(undefined, obraId);
  }, [obraId]); // Removendo dependências de funções para evitar loop infinito

  const configuracaoAtiva = configuracoes.find(c => c.ativo && (!obraId || c.obra_id === obraId));

  const alertasRecentes = historico
    .filter(h => obraId ? h.obra_id === obraId : true)
    .slice(0, 5);

  const notificacoesNaoLidas = notificacoes.filter(n => 
    n.tipo_notificacao === 'DASHBOARD' && n.status !== 'LIDA'
  );

  const handleProcessarAlertas = async () => {
    if (obraId) {
      await processarAlertasObra(obraId);
      await carregarHistorico(undefined, obraId);
    }
  };

  const handleEnviarNotificacoes = async () => {
    await enviarNotificacoesPendentes();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENVIADA':
      case 'LIDA':
        return 'bg-green-100 text-green-800';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERRO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO':
        return 'bg-red-100 text-red-800';
      case 'ALTO':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIO':
        return 'bg-yellow-100 text-yellow-800';
      case 'BAIXO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando alertas...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (onFecharConfiguracoes) {
                // Se há callback externo, não gerenciamos o estado interno
                return;
              }
              setMostrarConfiguracoes(true);
            }}
            disabled={processando}
            data-config-button
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          {obraId && (
            <Button
              onClick={handleProcessarAlertas}
              disabled={processando}
            >
              <Activity className="h-4 w-4 mr-2" />
              {processando ? 'Processando...' : 'Processar Alertas'}
            </Button>
          )}
        </div>
      </div>

      {/* Status da Configuração */}
      {!configuracaoAtiva && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma configuração de alerta ativa encontrada. 
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold"
              onClick={() => {
                if (onFecharConfiguracoes) {
                  // Se há callback externo, não gerenciamos o estado interno
                  return;
                }
                setMostrarConfiguracoes(true);
              }}
              data-config-button
            >
              Configure agora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoNotificacoes.total}</div>
            <p className="text-xs text-muted-foreground">
              {resumoNotificacoes.nao_lidas} não lidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoNotificacoes.pendentes}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando envio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoNotificacoes.enviadas}</div>
            <p className="text-xs text-muted-foreground">
              Com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoNotificacoes.erros}</div>
            <p className="text-xs text-muted-foreground">
              Falhas no envio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="notificacoes">
            Notificações
            {notificacoesNaoLidas.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {notificacoesNaoLidas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Configuração Ativa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração Ativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {configuracaoAtiva ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Thresholds:</span>
                      <div className="flex gap-1">
                        <Badge className={getAlertTypeColor('BAIXO')}>
                          {configuracaoAtiva.threshold_baixo}%
                        </Badge>
                        <Badge className={getAlertTypeColor('MEDIO')}>
                          {configuracaoAtiva.threshold_medio}%
                        </Badge>
                        <Badge className={getAlertTypeColor('ALTO')}>
                          {configuracaoAtiva.threshold_alto}%
                        </Badge>
                        <Badge className={getAlertTypeColor('CRITICO')}>
                          {configuracaoAtiva.threshold_critico}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Notificações:</span>
                      <div className="flex gap-2">
                        {configuracaoAtiva.notificar_email && (
                          <Mail className="h-4 w-4 text-blue-500" />
                        )}
                        {configuracaoAtiva.notificar_dashboard && (
                          <Bell className="h-4 w-4 text-green-500" />
                        )}
                        {configuracaoAtiva.notificar_webhook && (
                          <Webhook className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frequência:</span>
                      <span className="text-sm">{configuracaoAtiva.frequencia_verificacao}min</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma configuração ativa
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Alertas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Alertas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {alertasRecentes.length > 0 ? (
                    <div className="space-y-3">
                      {alertasRecentes.map((alerta) => (
                        <div key={alerta.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getAlertTypeColor(alerta.tipo_alerta)}>
                                {alerta.tipo_alerta}
                              </Badge>
                              <span className="text-sm font-medium">
                                {alerta.percentual_desvio.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Desvio: {formatCurrency(alerta.valor_desvio)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(alerta.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {alerta.acao}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum alerta recente
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Notificações Não Lidas */}
          {notificacoesNaoLidas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações Não Lidas ({notificacoesNaoLidas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificacoesNaoLidas.slice(0, 3).map((notificacao) => (
                    <div key={notificacao.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{notificacao.titulo}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notificacao.mensagem}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notificacao.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarNotificacaoLida(notificacao.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {notificacoesNaoLidas.length > 3 && (
                    <Button
                      variant="link"
                      onClick={() => setTabAtiva('notificacoes')}
                      className="w-full"
                    >
                      Ver todas as {notificacoesNaoLidas.length} notificações
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={handleEnviarNotificacoes}
                  disabled={processando || resumoNotificacoes.pendentes === 0}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Pendentes ({resumoNotificacoes.pendentes})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => carregarNotificacoes()}
                  disabled={processando}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <NotificacoesAlertas 
            notificacoes={notificacoes}
            onMarcarLida={marcarNotificacaoLida}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoAlertas 
            historico={historico}
            obraId={obraId}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Configurações */}
      {configuracoesVisivel && (
        <ConfiguracaoAlertasAvancadas
          obraId={obraId}
          configuracaoExistente={configuracaoAtiva}
          onClose={fecharConfiguracoes}
          onSalvar={() => {
            fecharConfiguracoes();
            carregarConfiguracoes(obraId);
          }}
        />
      )}
    </div>
  );
};