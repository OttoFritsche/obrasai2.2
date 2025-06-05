/**
 * 🔍 Consulta Avançada SINAPI
 * 
 * Componente completo para busca avançada de códigos SINAPI,
 * integrando dados normais e de manutenção com filtros inteligentes.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  Filter, 
  RotateCcw,
  Download,
  Eye,
  Calendar,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Settings2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useSinapiBuscaInteligente, useSinapiEstatisticas } from "@/hooks/useSinapiManutencoes";
import type { FiltrosBuscaUnificada } from "@/services/sinapiManutencoes";
import { ManutencaoIndicator, ManutencaoIndicatorCompact } from "./ManutencaoIndicator";
import { HistoricoModal } from "./HistoricoModal";
import { cn } from "@/lib/utils";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface ConsultaAvancadaProps {
  /**
   * Callback quando um código é selecionado
   */
  onCodigoSelecionado?: (codigo: number, item: any) => void;
  
  /**
   * Se deve mostrar opção de seleção
   */
  modoSelecao?: boolean;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
}

// ====================================
// 🔧 OPÇÕES DE FILTROS
// ====================================

const TIPOS_MANUTENCAO_PRINCIPAIS = [
  'ALTERAÇÃO DE DESCRIÇÃO',
  'ALTERAÇÃO DE ITENS/COEFICIENTES',
  'CRIAÇÃO DE COMPOSIÇÃO COM CUSTO',
  'CRIAÇÃO DE COMPOSIÇÃO SEM CUSTO',
  'COMPOSIÇÃO DESATIVADA',
  'DESATIVAÇÃO',
  'CRIAÇÃO DE INSUMO SEM PREÇO',
  'CRIAÇÃO DE INSUMO COM PREÇO',
];

const STATUS_OPCOES = [
  { value: 'ativo', label: 'Ativo', color: 'text-emerald-600' },
  { value: 'desativado', label: 'Desativado', color: 'text-red-600' },
  { value: 'alterado', label: 'Alterado', color: 'text-amber-600' },
];

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

export const ConsultaAvancada: React.FC<ConsultaAvancadaProps> = ({
  onCodigoSelecionado,
  modoSelecao = false,
  className
}) => {
  // Estados locais
  const [termoBusca, setTermoBusca] = useState("");
  const [filtrosAvancados, setFiltrosAvancados] = useState<Partial<FiltrosBuscaUnificada>>({
    incluir_manutencoes: true,
    status: ['ativo', 'alterado'],
    limit: 20
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Hooks para busca e estatísticas
  const {
    dados,
    total,
    pagina,
    totalPaginas,
    isLoading,
    isFetching,
    isError,
    error,
    alterarPagina,
    buscarInteligente,
    limparBusca,
    termoAtual,
    isCodigoNumerico
  } = useSinapiBuscaInteligente();

  const { estatisticas } = useSinapiEstatisticas();

  // ====================================
  // 🎯 HANDLERS DE EVENTOS
  // ====================================

  const handleBusca = useCallback((evento?: React.FormEvent) => {
    if (evento) evento.preventDefault();
    buscarInteligente(termoBusca);
  }, [termoBusca, buscarInteligente]);

  const handleLimparFiltros = useCallback(() => {
    setTermoBusca("");
    setFiltrosAvancados({
      incluir_manutencoes: true,
      status: ['ativo', 'alterado'],
      limit: 20
    });
    limparBusca();
  }, [limparBusca]);

  const handleFiltroChange = useCallback((chave: keyof FiltrosBuscaUnificada, valor: any) => {
    setFiltrosAvancados(prev => ({
      ...prev,
      [chave]: valor
    }));
  }, []);

  const handleCodigoClick = useCallback((codigo: number, item: any) => {
    if (onCodigoSelecionado) {
      onCodigoSelecionado(codigo, item);
    }
  }, [onCodigoSelecionado]);

  // ====================================
  // 🎨 COMPONENTES DE RENDERIZAÇÃO
  // ====================================

  const renderFiltrosAvancados = () => (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Filtros Avançados
        </CardTitle>
        <CardDescription>
          Refine sua busca com critérios específicos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPCOES.map(opcao => (
              <div key={opcao.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${opcao.value}`}
                  checked={filtrosAvancados.status?.includes(opcao.value as any)}
                  onCheckedChange={(checked) => {
                    const statusAtual = filtrosAvancados.status || [];
                    const novoStatus = checked 
                      ? [...statusAtual, opcao.value]
                      : statusAtual.filter(s => s !== opcao.value);
                    handleFiltroChange('status', novoStatus);
                  }}
                />
                <label 
                  htmlFor={`status-${opcao.value}`}
                  className={cn("text-sm cursor-pointer", opcao.color)}
                >
                  {opcao.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Manutenção */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tipos de Manutenção</label>
          <Select 
            value={filtrosAvancados.tipos_manutencao?.[0] || "todos"}
            onValueChange={(valor) => 
              handleFiltroChange('tipos_manutencao', valor === "todos" ? [] : [valor])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {TIPOS_MANUTENCAO_PRINCIPAIS.map(tipo => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Incluir Manutenções */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="incluir-manutencoes"
            checked={filtrosAvancados.incluir_manutencoes}
            onCheckedChange={(checked) => 
              handleFiltroChange('incluir_manutencoes', !!checked)
            }
          />
          <label htmlFor="incluir-manutencoes" className="text-sm cursor-pointer">
            Incluir dados de manutenções
          </label>
        </div>
      </CardContent>
    </Card>
  );

  const renderEstatisticas = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{estatisticas.total_registros.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total de registros</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold">{estatisticas.registros_recentes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Recentes (6 meses)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            <div>
              <div className="text-2xl font-bold">{total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Resultados encontrados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{pagina}</div>
              <div className="text-xs text-muted-foreground">de {totalPaginas} páginas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabela = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Resultados da Busca
            </CardTitle>
            <CardDescription>
              {total > 0 
                ? `${total.toLocaleString()} registros encontrados${termoAtual ? ` para "${termoAtual}"` : ''}`
                : 'Nenhum resultado encontrado'
              }
            </CardDescription>
          </div>

          {total > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Buscando...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Erro na busca: {error?.message}</span>
          </div>
        ) : dados.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum resultado encontrado</p>
            <p className="text-sm">Tente ajustar os filtros ou termo de busca</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Alteração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.map((item) => (
                    <TableRow 
                      key={item.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        modoSelecao && "cursor-pointer"
                      )}
                      onClick={() => modoSelecao && handleCodigoClick(item.codigo_sinapi, item)}
                    >
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.codigo_sinapi}</span>
                          <ManutencaoIndicatorCompact 
                            status={item.status_atual}
                            alteracoesRecentes={item.alteracoes_recentes}
                          />
                        </div>
                      </TableCell>
                      
                      <TableCell className="max-w-md">
                        <div className="truncate" title={item.descricao}>
                          {item.descricao}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <ManutencaoIndicator
                          status={item.status_atual}
                          tipoManutencao={item.tipo_manutencao}
                          ultimaAlteracao={item.ultima_alteracao}
                          size="sm"
                        />
                      </TableCell>
                      
                      <TableCell className="text-sm text-muted-foreground">
                        {item.ultima_alteracao 
                          ? format(new Date(item.ultima_alteracao), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <HistoricoModal
                            codigo={item.codigo_sinapi}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            }
                          />
                          
                          {modoSelecao && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCodigoClick(item.codigo_sinapi, item);
                              }}
                            >
                              Selecionar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => pagina > 1 && alterarPagina(pagina - 1)}
                        className={pagina <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pagina - 2 + i, totalPaginas - 4 + i));
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => alterarPagina(pageNum)}
                            isActive={pageNum === pagina}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => pagina < totalPaginas && alterarPagina(pagina + 1)}
                        className={pagina >= totalPaginas ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cabeçalho de busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Consulta Avançada SINAPI
          </CardTitle>
          <CardDescription>
            Busque códigos SINAPI normais e de manutenção com filtros inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBusca} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Digite código SINAPI ou descrição do serviço..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button type="submit" className="gap-2" disabled={isLoading}>
                <Search className="h-4 w-4" />
                Buscar
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="gap-2"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="gap-2"
                onClick={handleLimparFiltros}
              >
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
            </div>

            {/* Indicadores de busca */}
            {termoAtual && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Buscando por:</span>
                <Badge variant="secondary">{termoAtual}</Badge>
                {isCodigoNumerico && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Código numérico
                  </Badge>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Filtros avançados */}
      {mostrarFiltros && renderFiltrosAvancados()}

      {/* Estatísticas */}
      {renderEstatisticas()}

      <Separator />

      {/* Tabela de resultados */}
      {renderTabela()}
    </div>
  );
};

export default ConsultaAvancada; 