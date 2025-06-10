import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAdvancedAlerts } from '@/hooks/useAdvancedAlerts';
import { DashboardAlertasAvancados } from './DashboardAlertasAvancados';
import { ConfiguracaoAlertasAvancadas } from './ConfiguracaoAlertasAvancadas';
import { 
  AlertTriangle, 
  Settings, 
  Bell, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AlertasAvancadosObraProps {
  obraId: string;
  className?: string;
}

export const AlertasAvancadosObra: React.FC<AlertasAvancadosObraProps> = ({
  obraId,
  className = ''
}) => {
  const {
    configuracoes,
    resumoNotificacoes,
    loading,
    carregarConfiguracoes,
    carregarNotificacoes,
    carregarHistorico,
    buscarConfiguracaoPorObra
  } = useAdvancedAlerts();

  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const [configuracaoObra, setConfiguracaoObra] = useState<any>(null);
  const [carregandoConfiguracao, setCarregandoConfiguracao] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      setCarregandoConfiguracao(true);
      await carregarConfiguracoes(obraId);
      await carregarNotificacoes();
      await carregarHistorico(undefined, obraId);
      
      const config = await buscarConfiguracaoPorObra(obraId);
      setConfiguracaoObra(config);
      setCarregandoConfiguracao(false);
    };
    
    carregarDados();
  }, [obraId, carregarConfiguracoes, carregarNotificacoes, carregarHistorico, buscarConfiguracaoPorObra]);

  if (loading || carregandoConfiguracao) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Alertas Avançados</CardTitle>
          <CardDescription>Sistema de monitoramento de desvios orçamentários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando sistema de alertas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!configuracaoObra) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Avançados
          </CardTitle>
          <CardDescription>
            Sistema de monitoramento de desvios orçamentários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta obra ainda não possui configuração de alertas avançados.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setMostrarConfiguracoes(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Alertas
            </Button>
          </div>
        </CardContent>

        {mostrarConfiguracoes && (
          <ConfiguracaoAlertasAvancadas
            obraId={obraId}
            onClose={() => setMostrarConfiguracoes(false)}
            onSalvar={async () => {
              setMostrarConfiguracoes(false);
              await carregarConfiguracoes(obraId);
              const config = await buscarConfiguracaoPorObra(obraId);
              setConfiguracaoObra(config);
            }}
          />
        )}
      </Card>
    );
  }

  return (
    <div className={className}>
      <DashboardAlertasAvancados obraId={obraId} />
    </div>
  );
};