/**
 * 📊 Dashboard de Monitoramento SINAPI
 * 
 * Componente para monitoramento em tempo real das Edge Functions,
 * análise de performance e métricas de uso do sistema SINAPI.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  Zap} from "lucide-react";
import React, { useEffect,useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSinapiEdgeFunctions } from "@/hooks/useSinapiEdgeFunctions";
import { cn } from "@/lib/utils";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface Notificacao {
  titulo: string;
  mensagem: string;
  tipo?: 'info' | 'warning' | 'error' | 'success';
  data?: string;
  lida?: boolean;
}

interface MetricaPerformance {
  funcao: string;
  total_chamadas: number;
  tempo_medio_ms: number;
  taxa_erro: number;
  ultima_chamada: string;
  status: 'ativa' | 'lenta' | 'erro';
}

interface AlertaMonitoramento {
  id: string;
  tipo: 'performance' | 'erro' | 'volume';
  severidade: 'baixa' | 'media' | 'alta';
  mensagem: string;
  timestamp: string;
  resolvido: boolean;
}

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

export const MonitoringSinapi: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaMonitoramento[]>([]);
  const [metricas, setMetricas] = useState<MetricaPerformance[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const {
    verificarImpactos,
    useNotificacoes,
    isProcessandoNotificacao,
    analisarValidacao
  } = useSinapiEdgeFunctions();

  const { data: notificacoes, refetch: refetchNotificacoes } = useNotificacoes({
    apenas_nao_lidas: true
  });

  // ====================================
  // 🔄 EFEITOS E ATUALIZAÇÕES
  // ====================================

  useEffect(() => {
    // Simular dados de métricas (em produção, viriam da API)
    const dadosSimulados: MetricaPerformance[] = [
      {
        funcao: 'validate-sinapi-batch',
        total_chamadas: 1247,
        tempo_medio_ms: 180,
        taxa_erro: 2.1,
        ultima_chamada: new Date(Date.now() - 300000).toISOString(), // 5 min atrás
        status: 'ativa'
      },
      {
        funcao: 'sinapi-notifications',
        total_chamadas: 892,
        tempo_medio_ms: 95,
        taxa_erro: 0.5,
        ultima_chamada: new Date(Date.now() - 120000).toISOString(), // 2 min atrás
        status: 'ativa'
      }
    ];

    const alertasSimulados: AlertaMonitoramento[] = [
      {
        id: '1',
        tipo: 'performance',
        severidade: 'media',
        mensagem: 'Tempo de resposta da validação em lote acima de 200ms',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        resolvido: false
      }
    ];

    setMetricas(dadosSimulados);
    setAlertas(alertasSimulados);
  }, []);

  const atualizarDados = () => {
    setUltimaAtualizacao(new Date());
    refetchNotificacoes();
  };

  // ====================================
  // 📊 MÉTRICAS CALCULADAS
  // ====================================

  const metricas_resumo = {
    total_funcoes: metricas.length,
    funcoes_ativas: metricas.filter(m => m.status === 'ativa').length,
    tempo_medio_global: Math.round(
      metricas.reduce((acc, m) => acc + m.tempo_medio_ms, 0) / metricas.length
    ),
    taxa_erro_global: parseFloat(
      (metricas.reduce((acc, m) => acc + m.taxa_erro, 0) / metricas.length).toFixed(1)
    ),
    alertas_ativos: alertas.filter(a => !a.resolvido).length,
    notificacoes_nao_lidas: notificacoes?.length || 0
  };

  // ====================================
  // 🎨 COMPONENTES DE RENDERIZAÇÃO
  // ====================================

  const renderCardsResumo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funções Ativas</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas_resumo.funcoes_ativas}</div>
          <p className="text-xs text-muted-foreground">
            de {metricas_resumo.total_funcoes} Edge Functions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas_resumo.tempo_medio_global}ms</div>
          <p className="text-xs text-muted-foreground">
            Performance global
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas_resumo.taxa_erro_global}%</div>
          <p className="text-xs text-muted-foreground">
            Últimas 24 horas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas_resumo.alertas_ativos}</div>
          <p className="text-xs text-muted-foreground">
            Requerem atenção
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabelaMetricas = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Métricas de Performance
        </CardTitle>
        <CardDescription>
          Performance em tempo real das Edge Functions SINAPI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Função</TableHead>
              <TableHead>Total Chamadas</TableHead>
              <TableHead>Tempo Médio</TableHead>
              <TableHead>Taxa de Erro</TableHead>
              <TableHead>Última Chamada</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metricas.map((metrica) => (
              <TableRow key={metrica.funcao}>
                <TableCell className="font-medium">
                  {metrica.funcao}
                </TableCell>
                <TableCell>
                  {metrica.total_chamadas.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "font-medium",
                    metrica.tempo_medio_ms > 200 ? "text-orange-600" : "text-green-600"
                  )}>
                    {metrica.tempo_medio_ms}ms
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "font-medium",
                    metrica.taxa_erro > 5 ? "text-red-600" : 
                    metrica.taxa_erro > 2 ? "text-orange-600" : "text-green-600"
                  )}>
                    {metrica.taxa_erro}%
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(metrica.ultima_chamada).toLocaleString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      metrica.status === 'ativa' ? 'default' :
                      metrica.status === 'lenta' ? 'secondary' : 'destructive'
                    }
                  >
                    {metrica.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderAlertas = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertas do Sistema
        </CardTitle>
        <CardDescription>
          Alertas e notificações em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertas.filter(a => !a.resolvido).length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              ✅ Nenhum alerta ativo. Sistema funcionando normalmente.
            </AlertDescription>
          </Alert>
        ) : (
          alertas
            .filter(a => !a.resolvido)
            .map((alerta) => (
              <Alert 
                key={alerta.id}
                variant={alerta.severidade === 'alta' ? 'destructive' : 'default'}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge 
                        variant={
                          alerta.severidade === 'alta' ? 'destructive' :
                          alerta.severidade === 'media' ? 'secondary' : 'outline'
                        }
                        className="mb-2"
                      >
                        {alerta.tipo} - {alerta.severidade}
                      </Badge>
                      <p>{alerta.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alerta.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAlertas(prev => 
                          prev.map(a => 
                            a.id === alerta.id ? { ...a, resolvido: true } : a
                          )
                        );
                      }}
                    >
                      Resolver
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))
        )}
      </CardContent>
    </Card>
  );

  const renderNotificacoes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Notificações Recentes
        </CardTitle>
        <CardDescription>
          Últimas notificações geradas pelo sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metricas_resumo.notificacoes_nao_lidas === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma notificação pendente
          </p>
        ) : (
          <div className="space-y-2">
            {notificacoes?.slice(0, 5).map((notif: Notificacao, index: number) => (
              <div 
                key={index}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{notif.titulo}</p>
                  <p className="text-xs text-muted-foreground">{notif.mensagem}</p>
                </div>
                <Badge variant="outline">
                  {notif.tipo}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Monitoramento SINAPI
          </h1>
          <p className="text-muted-foreground">
            Dashboard de performance e alertas das Edge Functions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
          </Badge>
          <Button 
            onClick={atualizarDados}
            disabled={isProcessandoNotificacao}
            size="sm"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isProcessandoNotificacao && "animate-spin"
            )} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {renderCardsResumo()}

      {/* Tabs com Conteúdo */}
      <Tabs defaultValue="metricas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metricas">📊 Métricas</TabsTrigger>
          <TabsTrigger value="alertas">🔔 Alertas</TabsTrigger>
          <TabsTrigger value="notificacoes">📬 Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="metricas" className="space-y-4">
          {renderTabelaMetricas()}
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          {renderAlertas()}
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          {renderNotificacoes()}
        </TabsContent>
      </Tabs>
    </div>
  );
};