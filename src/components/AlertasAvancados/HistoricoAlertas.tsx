import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HistoricoAlerta } from '@/hooks/useAdvancedAlerts';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  Filter, 
  Search, 
  AlertTriangle, 
  RefreshCw,
  FileDown
} from 'lucide-react';

interface HistoricoAlertasProps {
  historico: HistoricoAlerta[];
  obraId?: string;
  loading: boolean;
}

export const HistoricoAlertas: React.FC<HistoricoAlertasProps> = ({
  historico,
  obraId,
  loading
}) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroAcao, setFiltroAcao] = useState<string>('');
  const [filtroBusca, setFiltroBusca] = useState<string>('');
  const [ordenacao, setOrdenacao] = useState<string>('data-desc');

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

  const getActionColor = (acao: string) => {
    switch (acao) {
      case 'CRIADO':
        return 'bg-blue-100 text-blue-800';
      case 'VISUALIZADO':
        return 'bg-purple-100 text-purple-800';
      case 'RESOLVIDO':
        return 'bg-green-100 text-green-800';
      case 'IGNORADO':
        return 'bg-gray-100 text-gray-800';
      case 'REATIVADO':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filtrarHistorico = () => {
    let historicoFiltrado = [...historico];

    if (filtroTipo && filtroTipo !== 'ALL_TYPES') {
      historicoFiltrado = historicoFiltrado.filter(h => h.tipo_alerta === filtroTipo);
    }

    if (filtroAcao && filtroAcao !== 'ALL_ACTIONS') {
      historicoFiltrado = historicoFiltrado.filter(h => h.acao === filtroAcao);
    }

    if (filtroBusca) {
      const termoBusca = filtroBusca.toLowerCase();
      historicoFiltrado = historicoFiltrado.filter(h => 
        h.tipo_alerta.toLowerCase().includes(termoBusca) ||
        h.acao.toLowerCase().includes(termoBusca) ||
        (h.observacoes && h.observacoes.toLowerCase().includes(termoBusca)) ||
        h.percentual_desvio.toString().includes(termoBusca) ||
        h.valor_desvio.toString().includes(termoBusca) ||
        (h.alertas_desvio?.descricao && h.alertas_desvio.descricao.toLowerCase().includes(termoBusca)) ||
        (h.alertas_desvio?.categoria && h.alertas_desvio.categoria.toLowerCase().includes(termoBusca)) ||
        (h.alertas_desvio?.etapa && h.alertas_desvio.etapa.toLowerCase().includes(termoBusca))
      );
    }

    // Ordenação
    switch (ordenacao) {
      case 'data-asc':
        historicoFiltrado.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'data-desc':
        historicoFiltrado.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'desvio-asc':
        historicoFiltrado.sort((a, b) => a.percentual_desvio - b.percentual_desvio);
        break;
      case 'desvio-desc':
        historicoFiltrado.sort((a, b) => b.percentual_desvio - a.percentual_desvio);
        break;
      case 'valor-asc':
        historicoFiltrado.sort((a, b) => a.valor_desvio - b.valor_desvio);
        break;
      case 'valor-desc':
        historicoFiltrado.sort((a, b) => b.valor_desvio - a.valor_desvio);
        break;
    }

    return historicoFiltrado;
  };

  const historicoFiltrado = filtrarHistorico();

  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroAcao('');
    setFiltroBusca('');
    setOrdenacao('data-desc');
  };

  const exportarCSV = () => {
    const headers = [
      'ID', 'Tipo de Alerta', 'Percentual de Desvio', 'Valor Orçado', 
      'Valor Realizado', 'Valor Desvio', 'Ação', 'Observações', 
      'Categoria', 'Etapa', 'Data'
    ];

    const rows = historicoFiltrado.map(h => [
      h.id,
      h.tipo_alerta,
      h.percentual_desvio.toFixed(2),
      h.valor_orcado.toFixed(2),
      h.valor_realizado.toFixed(2),
      h.valor_desvio.toFixed(2),
      h.acao,
      h.observacoes || '',
      h.alertas_desvio?.categoria || '',
      h.alertas_desvio?.etapa || '',
      format(new Date(h.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-alertas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando histórico...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Alertas
          </CardTitle>
          <CardDescription>
            Registro completo de alertas e ações tomadas
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
                  placeholder="Buscar no histórico..."
                  className="pl-8"
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="filtro-tipo" className="mb-2 block">Tipo de Alerta</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger id="filtro-tipo">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_TYPES">Todos os tipos</SelectItem>
                  <SelectItem value="BAIXO">Baixo</SelectItem>
                  <SelectItem value="MEDIO">Médio</SelectItem>
                  <SelectItem value="ALTO">Alto</SelectItem>
                  <SelectItem value="CRITICO">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="filtro-acao" className="mb-2 block">Ação</Label>
              <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                <SelectTrigger id="filtro-acao">
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_ACTIONS">Todas as ações</SelectItem>
                  <SelectItem value="CRIADO">Criado</SelectItem>
                  <SelectItem value="VISUALIZADO">Visualizado</SelectItem>
                  <SelectItem value="RESOLVIDO">Resolvido</SelectItem>
                  <SelectItem value="IGNORADO">Ignorado</SelectItem>
                  <SelectItem value="REATIVADO">Reativado</SelectItem>
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
                  <SelectItem value="desvio-desc">Desvio % (maior)</SelectItem>
                  <SelectItem value="desvio-asc">Desvio % (menor)</SelectItem>
                  <SelectItem value="valor-desc">Valor (maior)</SelectItem>
                  <SelectItem value="valor-asc">Valor (menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {historicoFiltrado.length} registros encontrados
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={exportarCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Tabela */}
          {historicoFiltrado.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Desvio</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Categoria/Etapa</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoFiltrado.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge className={getAlertTypeColor(item.tipo_alerta)}>
                          {item.tipo_alerta}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.percentual_desvio.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Orçado: {formatCurrency(item.valor_orcado)}</div>
                          <div>Realizado: {formatCurrency(item.valor_realizado)}</div>
                          <div className="font-medium">Desvio: {formatCurrency(item.valor_desvio)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.alertas_desvio && (
                          <div className="text-sm">
                            {item.alertas_desvio.categoria && (
                              <div>Categoria: {item.alertas_desvio.categoria}</div>
                            )}
                            {item.alertas_desvio.etapa && (
                              <div>Etapa: {item.alertas_desvio.etapa}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(item.acao)}>
                          {item.acao}
                        </Badge>
                        {item.observacoes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.observacoes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-md">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
              {(filtroTipo || filtroAcao || filtroBusca) && (
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