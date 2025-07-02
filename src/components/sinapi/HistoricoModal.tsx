/**
 * 📜 Modal de Histórico SINAPI
 * 
 * Modal para exibir histórico completo de alterações de códigos SINAPI
 * com timeline visual e informações detalhadas de cada manutenção.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Calendar, 
  FileText, 
  Activity,
  Filter,
  TrendingUp,
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useSinapiHistorico } from "@/hooks/useSinapiManutencoes";
import { ManutencaoIndicator } from "./ManutencaoIndicator";
import { cn } from "@/lib/utils";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface HistoricoModalProps {
  /**
   * Código SINAPI para buscar histórico
   */
  codigo: number;
  
  /**
   * Trigger do modal (botão, texto, etc.)
   */
  trigger?: React.ReactNode;
  
  /**
   * Se o modal deve abrir automaticamente
   */
  open?: boolean;
  
  /**
   * Callback para mudança de estado do modal
   */
  onOpenChange?: (open: boolean) => void;
}

// ====================================
// 🔧 FUNÇÕES AUXILIARES
// ====================================

/**
 * Determina o ícone baseado no tipo de manutenção
 */
const getTipoIcon = (tipoManutencao: string) => {
  if (tipoManutencao.includes('CRIAÇÃO')) return CheckCircle2;
  if (tipoManutencao.includes('DESATIV')) return XCircle;
  if (tipoManutencao.includes('ALTERAÇÃO')) return RefreshCw;
  return Info;
};

/**
 * Determina a cor baseada no tipo de manutenção
 */
const getTipoCor = (tipoManutencao: string) => {
  if (tipoManutencao.includes('CRIAÇÃO')) return 'text-emerald-600 dark:text-emerald-400';
  if (tipoManutencao.includes('DESATIV')) return 'text-red-600 dark:text-red-400';
  if (tipoManutencao.includes('ALTERAÇÃO')) return 'text-amber-600 dark:text-amber-400';
  return 'text-blue-600 dark:text-blue-400';
};

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

export const HistoricoModal: React.FC<HistoricoModalProps> = ({
  codigo,
  trigger,
  open,
  onOpenChange
}) => {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  
  // Hook para buscar histórico
  const { 
    historico, 
    dadosProcessados, 
    isLoading, 
    isError, 
    error 
  } = useSinapiHistorico(codigo);

  // Filtrar histórico por tipo
  const historicoFiltrado = useMemo(() => {
    if (filtroTipo === "todos") return historico;
    
    return historico.filter(item => 
      item.tipo_manutencao.toLowerCase().includes(filtroTipo.toLowerCase())
    );
  }, [historico, filtroTipo]);

  // Tipos únicos para filtro
  const tiposDisponiveis = useMemo(() => {
    const tipos = [...new Set(historico.map(item => item.tipo_manutencao))];
    return tipos.sort();
  }, [historico]);

  // Trigger padrão
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <History className="h-4 w-4" />
      Ver Histórico
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Histórico de Alterações - Código {codigo}
          </DialogTitle>
          <DialogDescription>
            Acompanhe todas as mudanças e atualizações deste código SINAPI ao longo do tempo
          </DialogDescription>
        </DialogHeader>

        {/* Estados de carregamento e erro */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Erro ao carregar histórico: {error?.message}</span>
          </div>
        )}

        {/* Conteúdo principal */}
        {!isLoading && !isError && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Estatísticas e filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Estatísticas */}
              {dadosProcessados && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {dadosProcessados.total_alteracoes} alterações
                  </Badge>
                  
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Última: {format(new Date(dadosProcessados.ultima_alteracao.data_referencia), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                </div>
              )}

              {/* Filtro por tipo */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tiposDisponiveis.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Timeline de alterações */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {historicoFiltrado.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum registro encontrado para os filtros selecionados</p>
                  </div>
                ) : (
                  historicoFiltrado.map((item, index) => {
                    const IconComponent = getTipoIcon(item.tipo_manutencao);
                    const corTipo = getTipoCor(item.tipo_manutencao);
                    const isUltimo = index === historicoFiltrado.length - 1;

                    return (
                      <div key={item.id} className="relative">
                        {/* Linha da timeline */}
                        {!isUltimo && (
                          <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                        )}

                        <Card className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              {/* Ícone e linha da timeline */}
                              <div className="flex flex-col items-center">
                                <div className={cn(
                                  "rounded-full p-2 bg-background border-2 border-current",
                                  corTipo
                                )}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                              </div>

                              {/* Conteúdo do card */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <CardTitle className="text-base">
                                    {item.tipo_manutencao}
                                  </CardTitle>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(item.data_referencia), 'dd/MM/yyyy', { locale: ptBR })}
                                  </div>
                                </div>

                                <CardDescription className="text-sm">
                                  <strong>Tipo:</strong> {item.tipo}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <div className="ml-10">
                              <p className="text-sm text-foreground leading-relaxed">
                                {item.descricao}
                              </p>
                              
                              {/* Indicador de status baseado no tipo */}
                              <div className="mt-3 flex items-center gap-2">
                                <ManutencaoIndicator
                                  status={
                                    item.tipo_manutencao.includes('DESATIV') ? 'desativado' :
                                    item.tipo_manutencao.includes('CRIAÇÃO') ? 'ativo' : 'alterado'
                                  }
                                  tipoManutencao={item.tipo_manutencao}
                                  ultimaAlteracao={item.data_referencia}
                                  size="sm"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Resumo estatístico */}
            {dadosProcessados && dadosProcessados.total_alteracoes > 0 && (
              <>
                <Separator />
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Resumo das Alterações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(dadosProcessados.alteracoes_por_tipo).map(([tipo, qtd]) => (
                        <div key={tipo} className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{qtd}</div>
                          <div className="text-xs text-muted-foreground">{tipo}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoModal; 