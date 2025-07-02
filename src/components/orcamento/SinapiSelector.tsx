/**
 * 🔍 SINAPI Selector para Orçamentos
 * 
 * Componente especializado para seleção de códigos SINAPI
 * dentro do wizard de orçamento, com validação automática
 * e interface otimizada.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus,
  AlertTriangle,
  Database,
  Eye,
  Trash2,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

import { useSinapiBuscaInteligente, useSinapiValidacao } from "@/hooks/useSinapiManutencoes";
import { ManutencaoIndicatorCompact } from "@/components/sinapi/ManutencaoIndicator";
import { HistoricoModal } from "@/components/sinapi/HistoricoModal";
import { cn } from "@/lib/utils";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface SinapiItem {
  codigo_sinapi: number;
  descricao: string;
  status_atual: 'ativo' | 'desativado' | 'alterado';
  fonte: 'normal' | 'manutencao';
  tipo_manutencao?: string;
  data_alteracao?: string;
}

interface AlternativaSugerida {
  codigo: string;
  descricao: string;
  unidade: string;
  preco_referencia?: number;
  similarity_score?: number;
}

interface CodigoSelecionado {
  codigo: number;
  descricao: string;
  status: 'ativo' | 'desativado' | 'alterado';
  validacao?: {
    existe: boolean;
    ativo: boolean;
    alteracoes_recentes: boolean;
    mensagem: string;
    alternativas_sugeridas?: AlternativaSugerida[];
  };
}

interface SinapiSelectorProps {
  /**
   * Códigos já selecionados
   */
  codigosSelecionados?: CodigoSelecionado[];
  
  /**
   * Callback quando códigos são alterados
   */
  onCodigosChange?: (codigos: CodigoSelecionado[]) => void;
  
  /**
   * Se deve validar automaticamente
   */
  validacaoAutomatica?: boolean;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
}

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

export const SinapiSelector: React.FC<SinapiSelectorProps> = ({
  codigosSelecionados = [],
  onCodigosChange,
  validacaoAutomatica = true,
  className
}) => {
  // Estados locais
  const [termoBusca, setTermoBusca] = useState("");
  const [codigoInputManual, setCodigoInputManual] = useState("");
  const [historicoAberto, setHistoricoAberto] = useState<number | null>(null);

  // Hooks SINAPI
  const {
    dados,
    isLoading,
    buscarInteligente,
    limparBusca
  } = useSinapiBuscaInteligente();

  const { validarCodigos } = useSinapiValidacao();

  // ====================================
  // 🎯 FUNÇÕES DE MANIPULAÇÃO
  // ====================================

  const adicionarCodigo = useCallback(async (item: SinapiItem) => {
    const novosCodigos = [...codigosSelecionados];
    
    // Verificar se já existe
    const jaExiste = novosCodigos.find(c => c.codigo === item.codigo_sinapi);
    if (jaExiste) {
      toast.warning(`Código ${item.codigo_sinapi} já foi adicionado!`);
      return;
    }

    const novoCodigo: CodigoSelecionado = {
      codigo: item.codigo_sinapi,
      descricao: item.descricao,
      status: item.status_atual
    };

    // Validação automática se habilitada
    if (validacaoAutomatica) {
      try {
        const validacao = await validarCodigos([item.codigo_sinapi]);
        novoCodigo.validacao = validacao[0];
        
        if (!validacao[0]?.existe) {
          toast.warning(`⚠️ Código ${item.codigo_sinapi}: ${validacao[0]?.mensagem}`);
        } else if (!validacao[0]?.ativo) {
          toast.warning(`⚠️ Código ${item.codigo_sinapi}: Código desativado`);
        } else if (validacao[0]?.alteracoes_recentes) {
          toast.info(`ℹ️ Código ${item.codigo_sinapi}: Teve alterações recentes`);
        }
      } catch (error) {
        console.error('Erro na validação:', error);
      }
    }

    novosCodigos.push(novoCodigo);
    onCodigosChange?.(novosCodigos);
    
    toast.success(`✅ Código ${item.codigo_sinapi} adicionado!`);
  }, [codigosSelecionados, onCodigosChange, validacaoAutomatica, validarCodigos]);

  const removerCodigo = useCallback((codigo: number) => {
    const novosCodigos = codigosSelecionados.filter(c => c.codigo !== codigo);
    onCodigosChange?.(novosCodigos);
    toast.info(`🗑️ Código ${codigo} removido`);
  }, [codigosSelecionados, onCodigosChange]);

  const adicionarCodigoManual = useCallback(async () => {
    const codigo = parseInt(codigoInputManual);
    if (isNaN(codigo)) {
      toast.error("Digite um código numérico válido");
      return;
    }

    try {
      // Buscar o código específico
      await buscarInteligente(codigo.toString());
      setCodigoInputManual("");
    } catch (error) {
      toast.error("Erro ao buscar código");
    }
  }, [codigoInputManual, buscarInteligente]);

  const limparSelecao = useCallback(() => {
    onCodigosChange?.([]);
    limparBusca();
    setTermoBusca("");
    toast.info("🧹 Seleção limpa");
  }, [onCodigosChange, limparBusca]);

  // ====================================
  // 📊 MÉTRICAS E ESTATÍSTICAS
  // ====================================

  const metricas = useMemo(() => {
    const total = codigosSelecionados.length;
    const ativos = codigosSelecionados.filter(c => c.status === 'ativo').length;
    const desativados = codigosSelecionados.filter(c => c.status === 'desativado').length;
    const alterados = codigosSelecionados.filter(c => c.status === 'alterado').length;
    const comProblemas = codigosSelecionados.filter(c => 
      !c.validacao?.existe || !c.validacao?.ativo
    ).length;

    return { total, ativos, desativados, alterados, comProblemas };
  }, [codigosSelecionados]);

  // ====================================
  // 🎨 COMPONENTES DE RENDERIZAÇÃO
  // ====================================

  const renderBuscaRapida = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4" />
          Busca de Códigos SINAPI
        </CardTitle>
        <CardDescription>
          Digite um código ou termo para buscar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca por termo */}
        <div className="flex gap-2">
          <Input
            placeholder="Ex: alvenaria, 74090, etc..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarInteligente(termoBusca)}
          />
          <Button 
            onClick={() => buscarInteligente(termoBusca)}
            disabled={!termoBusca || isLoading}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Adição manual de código */}
        <div className="flex gap-2">
          <Input
            placeholder="Código específico..."
            value={codigoInputManual}
            onChange={(e) => setCodigoInputManual(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarCodigoManual()}
            type="number"
          />
          <Button 
            onClick={adicionarCodigoManual}
            disabled={!codigoInputManual}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderResultadosBusca = () => {
    if (!dados || dados.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultados da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.slice(0, 5).map((item, index) => (
                <TableRow key={`${item.codigo_sinapi}-${item.fonte}-${item.data_alteracao || 'nodate'}-${index}`}>
                  <TableCell className="font-mono">{item.codigo_sinapi}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.descricao}</TableCell>
                  <TableCell>
                    <ManutencaoIndicatorCompact
                      status={item.status_atual}
                      tipoManutencao={item.tipo_manutencao}
                      dataAlteracao={item.data_alteracao}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adicionarCodigo(item)}
                        disabled={codigosSelecionados.some(c => c.codigo === item.codigo_sinapi)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setHistoricoAberto(item.codigo_sinapi)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderCodigosSelecionados = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Códigos Selecionados ({metricas.total})
          </span>
          {codigosSelecionados.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={limparSelecao}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Métricas */}
        {codigosSelecionados.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Badge variant="secondary" className="text-center py-1">
              {metricas.ativos} Ativos
            </Badge>
            <Badge variant="destructive" className="text-center py-1">
              {metricas.desativados} Desativados
            </Badge>
            <Badge variant="outline" className="text-center py-1">
              {metricas.alterados} Alterados
            </Badge>
            {metricas.comProblemas > 0 && (
              <Badge variant="destructive" className="text-center py-1">
                {metricas.comProblemas} c/ Problemas
              </Badge>
            )}
          </div>
        )}

        {/* Lista de códigos selecionados */}
        {codigosSelecionados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum código selecionado ainda</p>
            <p className="text-sm">Use a busca acima para adicionar códigos</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {codigosSelecionados.map((codigo) => (
              <div 
                key={codigo.codigo}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg",
                  !codigo.validacao?.existe || !codigo.validacao?.ativo && "border-red-200 bg-red-50"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{codigo.codigo}</span>
                    <ManutencaoIndicatorCompact
                      status={codigo.status}
                      compact
                    />
                  </div>
                  <p className="text-sm text-gray-600 truncate">{codigo.descricao}</p>
                  
                  {/* Alertas de validação */}
                  {codigo.validacao && (!codigo.validacao.existe || !codigo.validacao.ativo) && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {codigo.validacao.mensagem}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHistoricoAberto(codigo.codigo)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removerCodigo(codigo.codigo)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
    <div className={cn("space-y-6", className)}>
      {/* Busca rápida */}
      {renderBuscaRapida()}

      {/* Resultados da busca */}
      {renderResultadosBusca()}

      {/* Códigos selecionados */}
      {renderCodigosSelecionados()}

      {/* Modal de histórico */}
      {historicoAberto && (
        <HistoricoModal
          codigoSinapi={historicoAberto}
          isOpen={!!historicoAberto}
          onClose={() => setHistoricoAberto(null)}
        />
      )}

      {/* Alertas gerais */}
      {metricas.comProblemas > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metricas.comProblemas} código(s) com problemas foram detectados. 
            Verifique os alertas para cada código.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SinapiSelector;