import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NotificacaoAlerta } from '@/hooks/useAdvancedAlerts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  Filter, 
  Search, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  Mail,
  Webhook,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface NotificacoesAlertasProps {
  notificacoes: NotificacaoAlerta[];
  onMarcarLida: (id: string) => Promise<boolean>;
  loading: boolean;
}

export const NotificacoesAlertas: React.FC<NotificacoesAlertasProps> = ({
  notificacoes,
  onMarcarLida,
  loading
}) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroBusca, setFiltroBusca] = useState<string>('');
  const [ordenacao, setOrdenacao] = useState<string>('data-desc');
  const [processando, setProcessando] = useState<Record<string, boolean>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENVIADA':
        return 'bg-green-100 text-green-800';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERRO':
        return 'bg-red-100 text-red-800';
      case 'LIDA':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoNotificacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'EMAIL':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'DASHBOARD':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'WEBHOOK':
        return <Webhook className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENVIADA':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ERRO':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'LIDA':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filtrarNotificacoes = () => {
    let notificacoesFiltradas = [...notificacoes];

    if (filtroTipo) {
      notificacoesFiltradas = notificacoesFiltradas.filter(n => n.tipo_notificacao === filtroTipo);
    }

    if (filtroStatus) {
      notificacoesFiltradas = notificacoesFiltradas.filter(n => n.status === filtroStatus);
    }

    if (filtroBusca) {
      const termoBusca = filtroBusca.toLowerCase();
      notificacoesFiltradas = notificacoesFiltradas.filter(n => 
        n.titulo.toLowerCase().includes(termoBusca) ||
        n.mensagem.toLowerCase().includes(termoBusca) ||
        n.tipo_notificacao.toLowerCase().includes(termoBusca) ||
        n.status.toLowerCase().includes(termoBusca) ||
        (n.alertas_desvio?.obras?.nome && n.alertas_desvio.obras.nome.toLowerCase().includes(termoBusca))
      );
    }

    // Ordenação
    switch (ordenacao) {
      case 'data-asc':
        notificacoesFiltradas.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'data-desc':
        notificacoesFiltradas.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'status':
        notificacoesFiltradas.sort((a, b) => {
          const statusPriority: Record<string, number> = {
            'PENDENTE': 1,
            'ERRO': 2,
            'ENVIADA': 3,
            'LIDA': 4
          };
          return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
        });
        break;
      case 'tipo':
        notificacoesFiltradas.sort((a, b) => a.tipo_notificacao.localeCompare(b.tipo_notificacao));
        break;
    }

    return notificacoesFiltradas;
  };

  const notificacoesFiltradas = filtrarNotificacoes();

  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroStatus('');
    setFiltroBusca('');
    setOrdenacao('data-desc');
  };

  const handleMarcarLida = async (id: string) => {
    setProcessando(prev => ({ ...prev, [id]: true }));
    await onMarcarLida(id);
    setProcessando(prev => ({ ...prev, [id]: false }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando notificações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações de Alertas
          </CardTitle>
          <CardDescription>
            Notificações enviadas pelo sistema de alertas avançados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="busca" className="mb-2 block">Busca</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Buscar notificações..."
                  className="pl-8"
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="filtro-tipo" className="mb-2 block">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger id="filtro-tipo">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="DASHBOARD">Dashboard</SelectItem>
                  <SelectItem value="WEBHOOK">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="filtro-status" className="mb-2 block">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="filtro-status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="ENVIADA">Enviada</SelectItem>
                  <SelectItem value="ERRO">Erro</SelectItem>
                  <SelectItem value="LIDA">Lida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="ordenacao" className="mb-2 block">Ordenar por</Label>
              <Select value={ordenacao} onValueChange={setOrdenacao}>
                <SelectTrigger id="ordenacao">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data-desc">Data (mais recente)</SelectItem>
                  <SelectItem value="data-asc">Data (mais antiga)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="tipo">Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {notificacoesFiltradas.length} notificações encontradas
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Tabela */}
          {notificacoesFiltradas.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[40%]">Mensagem</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificacoesFiltradas.map((notificacao) => (
                    <TableRow key={notificacao.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTipoNotificacaoIcon(notificacao.tipo_notificacao)}
                          <span>{notificacao.tipo_notificacao}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(notificacao.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(notificacao.status)}
                            <span>{notificacao.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{notificacao.titulo}</div>
                          <div className="text-sm text-muted-foreground">{notificacao.mensagem}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notificacao.alertas_desvio?.obras?.nome || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{format(new Date(notificacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(notificacao.created_at), 'HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notificacao.status !== 'LIDA' && notificacao.tipo_notificacao === 'DASHBOARD' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarLida(notificacao.id)}
                            disabled={processando[notificacao.id]}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {processando[notificacao.id] ? 'Marcando...' : 'Marcar como lida'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-md">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
              {(filtroTipo || filtroStatus || filtroBusca) && (
                <Button variant="link" onClick={limparFiltros} className="mt-2">
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};