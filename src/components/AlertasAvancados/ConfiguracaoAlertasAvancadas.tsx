import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { ConfiguracaoAlertaAvancada } from '@/hooks/useAdvancedAlerts';
import { useAdvancedAlerts } from '@/hooks/useAdvancedAlerts';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Mail, 
  Bell, 
  Webhook, 
  TestTube, 
  Save, 
  X,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

interface ConfiguracaoAlertasAvancadasProps {
  obraId?: string;
  configuracaoExistente?: ConfiguracaoAlertaAvancada;
  onClose: () => void;
  onSalvar: () => void;
}

export const ConfiguracaoAlertasAvancadas: React.FC<ConfiguracaoAlertasAvancadasProps> = ({
  obraId,
  configuracaoExistente,
  onClose,
  onSalvar
}) => {
  const { salvarConfiguracao, testarWebhook, processando } = useAdvancedAlerts();
  const { toast } = useToast();
  
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAlertaAvancada>({
    obra_id: obraId || '',
    usuario_id: '',
    threshold_baixo: 5,
    threshold_medio: 15,
    threshold_alto: 25,
    threshold_critico: 40,
    notificar_email: true,
    notificar_dashboard: true,
    notificar_webhook: false,
    webhook_url: '',
    alertas_por_categoria: true,
    alertas_por_etapa: true,
    frequencia_verificacao: 60,
    ativo: true,
    ...configuracaoExistente
  });

  const [testando, setTestando] = useState(false);
  const [webhookTestado, setWebhookTestado] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);

  useEffect(() => {
    if (configuracaoExistente) {
      setConfiguracao(prev => ({ ...prev, ...configuracaoExistente }));
    }
  }, [configuracaoExistente]);

  const validarConfiguracao = (): boolean => {
    const erros: string[] = [];

    if (!configuracao.obra_id) {
      erros.push('ID da obra é obrigatório');
    }

    if (configuracao.threshold_baixo >= configuracao.threshold_medio) {
      erros.push('Threshold baixo deve ser menor que médio');
    }

    if (configuracao.threshold_medio >= configuracao.threshold_alto) {
      erros.push('Threshold médio deve ser menor que alto');
    }

    if (configuracao.threshold_alto >= configuracao.threshold_critico) {
      erros.push('Threshold alto deve ser menor que crítico');
    }

    if (configuracao.notificar_webhook && !configuracao.webhook_url) {
      erros.push('URL do webhook é obrigatória quando notificação por webhook está ativa');
    }

    if (configuracao.webhook_url && !isValidUrl(configuracao.webhook_url)) {
      erros.push('URL do webhook deve ser válida');
    }

    if (configuracao.frequencia_verificacao < 5) {
      erros.push('Frequência de verificação deve ser de pelo menos 5 minutos');
    }

    if (!configuracao.notificar_email && !configuracao.notificar_dashboard && !configuracao.notificar_webhook) {
      erros.push('Pelo menos um tipo de notificação deve estar ativo');
    }

    setErrosValidacao(erros);
    return erros.length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSalvar = async () => {
    if (!validarConfiguracao()) {
      return;
    }

    const sucesso = await salvarConfiguracao(configuracao);
    if (sucesso) {
      onSalvar();
    }
  };

  const handleTestarWebhook = async () => {
    if (!configuracao.webhook_url || !isValidUrl(configuracao.webhook_url)) {
      toast({
        title: "Erro",
        description: "URL do webhook inválida",
        variant: "destructive"
      });
      return;
    }

    setTestando(true);
    const sucesso = await testarWebhook(configuracao.webhook_url);
    setWebhookTestado(sucesso);
    setTestando(false);
  };

  const updateThreshold = (tipo: string, valor: number[]) => {
    setConfiguracao(prev => ({
      ...prev,
      [`threshold_${tipo}`]: valor[0]
    }));
  };

  const getThresholdColor = (tipo: string) => {
    switch (tipo) {
      case 'baixo': return 'bg-blue-100 text-blue-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'alto': return 'bg-orange-100 text-orange-800';
      case 'critico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Alertas Avançados
          </DialogTitle>
          <DialogDescription>
            Configure thresholds, notificações e comportamentos do sistema de alertas
          </DialogDescription>
        </DialogHeader>

        {errosValidacao.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errosValidacao.map((erro, index) => (
                  <li key={index}>{erro}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="thresholds" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="thresholds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Thresholds</CardTitle>
                <CardDescription>
                  Defina os percentuais de desvio que irão disparar alertas de diferentes níveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Threshold Baixo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold-baixo">Alerta Baixo</Label>
                    <Badge className={getThresholdColor('baixo')}>
                      {configuracao.threshold_baixo}%
                    </Badge>
                  </div>
                  <Slider
                    id="threshold-baixo"
                    min={1}
                    max={20}
                    step={1}
                    value={[configuracao.threshold_baixo]}
                    onValueChange={(valor) => updateThreshold('baixo', valor)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Desvios entre 0% e {configuracao.threshold_baixo}% serão classificados como baixos
                  </p>
                </div>

                {/* Threshold Médio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold-medio">Alerta Médio</Label>
                    <Badge className={getThresholdColor('medio')}>
                      {configuracao.threshold_medio}%
                    </Badge>
                  </div>
                  <Slider
                    id="threshold-medio"
                    min={configuracao.threshold_baixo + 1}
                    max={30}
                    step={1}
                    value={[configuracao.threshold_medio]}
                    onValueChange={(valor) => updateThreshold('medio', valor)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Desvios entre {configuracao.threshold_baixo + 1}% e {configuracao.threshold_medio}% serão classificados como médios
                  </p>
                </div>

                {/* Threshold Alto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold-alto">Alerta Alto</Label>
                    <Badge className={getThresholdColor('alto')}>
                      {configuracao.threshold_alto}%
                    </Badge>
                  </div>
                  <Slider
                    id="threshold-alto"
                    min={configuracao.threshold_medio + 1}
                    max={50}
                    step={1}
                    value={[configuracao.threshold_alto]}
                    onValueChange={(valor) => updateThreshold('alto', valor)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Desvios entre {configuracao.threshold_medio + 1}% e {configuracao.threshold_alto}% serão classificados como altos
                  </p>
                </div>

                {/* Threshold Crítico */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold-critico">Alerta Crítico</Label>
                    <Badge className={getThresholdColor('critico')}>
                      {configuracao.threshold_critico}%
                    </Badge>
                  </div>
                  <Slider
                    id="threshold-critico"
                    min={configuracao.threshold_alto + 1}
                    max={100}
                    step={1}
                    value={[configuracao.threshold_critico]}
                    onValueChange={(valor) => updateThreshold('critico', valor)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Desvios acima de {configuracao.threshold_alto + 1}% serão classificados como críticos
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Os thresholds devem ser configurados em ordem crescente. Alertas críticos têm prioridade máxima.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Notificação por Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar-email"
                      checked={configuracao.notificar_email}
                      onCheckedChange={(checked) => 
                        setConfiguracao(prev => ({ ...prev, notificar_email: checked }))
                      }
                    />
                    <Label htmlFor="notificar-email">Ativar notificações por email</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviar alertas por email para os usuários responsáveis pela obra
                  </p>
                </CardContent>
              </Card>

              {/* Notificação no Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar-dashboard"
                      checked={configuracao.notificar_dashboard}
                      onCheckedChange={(checked) => 
                        setConfiguracao(prev => ({ ...prev, notificar_dashboard: checked }))
                      }
                    />
                    <Label htmlFor="notificar-dashboard">Ativar notificações no dashboard</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Exibir alertas em tempo real no dashboard da aplicação
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Webhook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notificar-webhook"
                    checked={configuracao.notificar_webhook}
                    onCheckedChange={(checked) => 
                      setConfiguracao(prev => ({ ...prev, notificar_webhook: checked }))
                    }
                  />
                  <Label htmlFor="notificar-webhook">Ativar notificações por webhook</Label>
                </div>
                
                {configuracao.notificar_webhook && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">URL do Webhook</Label>
                      <Input
                        id="webhook-url"
                        type="url"
                        placeholder="https://exemplo.com/webhook"
                        value={configuracao.webhook_url || ''}
                        onChange={(e) => 
                          setConfiguracao(prev => ({ ...prev, webhook_url: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestarWebhook}
                        disabled={testando || !configuracao.webhook_url}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {testando ? 'Testando...' : 'Testar Webhook'}
                      </Button>
                      {webhookTestado && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Testado
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      O webhook receberá um POST com dados do alerta em formato JSON
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avancado" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Configurações de Alertas */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Alertas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alertas-categoria"
                      checked={configuracao.alertas_por_categoria}
                      onCheckedChange={(checked) => 
                        setConfiguracao(prev => ({ ...prev, alertas_por_categoria: checked }))
                      }
                    />
                    <Label htmlFor="alertas-categoria">Alertas por categoria</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alertas-etapa"
                      checked={configuracao.alertas_por_etapa}
                      onCheckedChange={(checked) => 
                        setConfiguracao(prev => ({ ...prev, alertas_por_etapa: checked }))
                      }
                    />
                    <Label htmlFor="alertas-etapa">Alertas por etapa</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="configuracao-ativa"
                      checked={configuracao.ativo}
                      onCheckedChange={(checked) => 
                        setConfiguracao(prev => ({ ...prev, ativo: checked }))
                      }
                    />
                    <Label htmlFor="configuracao-ativa">Configuração ativa</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Frequência */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequência de Verificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Verificar a cada {configuracao.frequencia_verificacao} minutos</Label>
                    <Slider
                      id="frequencia"
                      min={5}
                      max={1440}
                      step={5}
                      value={[configuracao.frequencia_verificacao]}
                      onValueChange={(valor) => 
                        setConfiguracao(prev => ({ ...prev, frequencia_verificacao: valor[0] }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 min</span>
                      <span>24h</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Frequência com que o sistema verificará novos desvios orçamentários
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configurações avançadas permitem personalizar o comportamento detalhado do sistema de alertas.
                Frequências muito baixas podem impactar a performance do sistema.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processando}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={processando}>
            <Save className="h-4 w-4 mr-2" />
            {processando ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};