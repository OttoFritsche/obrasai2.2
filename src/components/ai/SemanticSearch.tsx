import React, { useState, useCallback, useEffect } from 'react';
import { Search, Loader2, Filter, X, Info, TrendingUp, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAIFeatures } from '@/hooks/useAIFeatures';

/**
 * 🔍 Componente: Busca Semântica SINAPI
 * 
 * Interface para busca semântica inteligente nos dados SINAPI
 * usando embeddings e IA para encontrar insumos e composições similares.
 * 
 * @author Pharma.AI Team
 */

// Interfaces para tipagem
interface SearchResult {
  id: string;
  tipo: 'insumo' | 'composicao';
  codigo_sinapi: string;
  descricao: string;
  unidade: string;
  categoria?: string;
  preco_referencia?: number;
  similarity_score: number;
  explanation?: string;
}

interface SemanticSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  defaultQuery?: string;
  showFilters?: boolean;
  maxResults?: number;
  className?: string;
}

interface SearchFilters {
  estado: string;
  tipo_busca: 'insumos' | 'composicoes' | 'ambos';
  categoria?: string;
  threshold: number;
}

export function SemanticSearch({
  onResultSelect,
  defaultQuery = '',
  showFilters = true,
  maxResults = 20,
  className = ''
}: SemanticSearchProps) {
  const { toast } = useToast();
  const {
    searchSinapi,
    searchResults,
    searchLoading,
    searchSuggestions,
    lastSearchQuery,
    searchBySuggestion,
    explainSinapiResult,
    clearSearchResults,
    hasError,
    lastError
  } = useAIFeatures();

  // Estados locais
  const [query, setQuery] = useState(defaultQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    estado: 'SP',
    tipo_busca: 'ambos',
    threshold: 0.7
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  // Estados brasileiros para filtro
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Executar busca
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "Digite um termo para buscar",
        variant: "destructive"
      });
      return;
    }

    await searchSinapi({
      query: query.trim(),
      limit: maxResults,
      threshold: filters.threshold,
      tipo_busca: filters.tipo_busca,
      estado: filters.estado,
      categoria: filters.categoria
    });
  }, [query, filters, maxResults, searchSinapi, toast]);

  // Buscar por sugestão
  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    setQuery(suggestion);
    await searchBySuggestion(suggestion, filters.estado);
  }, [searchBySuggestion, filters.estado]);

  // Explicar resultado
  const handleExplainResult = useCallback(async (result: SearchResult) => {
    setExplainLoading(true);
    try {
      const explanation = await explainSinapiResult(result);
      setSelectedResult({ ...result, explanation });
    } catch (error) {
      console.error('Erro ao explicar resultado:', error);
    } finally {
      setExplainLoading(false);
    }
  }, [explainSinapiResult]);

  // Selecionar resultado
  const handleResultSelect = useCallback((result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setSelectedResult(result);
  }, [onResultSelect]);

  // Limpar busca
  const handleClearSearch = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedResult(null);
  }, [clearSearchResults]);

  // Buscar ao pressionar Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searchLoading) {
      handleSearch();
    }
  }, [handleSearch, searchLoading]);

  // Formatar preço
  const formatPrice = useCallback((price: number | null | undefined) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  // Cor do badge baseada no score de similaridade
  const getSimilarityBadgeVariant = useCallback((score: number) => {
    if (score >= 0.9) return 'default'; // Verde
    if (score >= 0.8) return 'secondary'; // Azul
    if (score >= 0.7) return 'outline'; // Cinza
    return 'destructive'; // Vermelho
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header da Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Semântica SINAPI
          </CardTitle>
          <CardDescription>
            Use IA para encontrar insumos e composições similares nos dados SINAPI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de Busca Principal */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Ex: cimento portland, tijolo cerâmico, mão de obra pedreiro..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={searchLoading}
                className="pr-10"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={searchLoading || !query.trim()}
              className="min-w-[100px]"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {/* Filtros Básicos */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <Select
                value={filters.estado}
                onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estados.map(estado => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.tipo_busca}
                onValueChange={(value: 'ambos' | 'insumos' | 'composicoes') => setFilters(prev => ({ ...prev, tipo_busca: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Ambos</SelectItem>
                  <SelectItem value="insumos">Insumos</SelectItem>
                  <SelectItem value="composicoes">Composições</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          )}

          {/* Filtros Avançados */}
          {showAdvancedFilters && (
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Limite de Similaridade: {filters.threshold}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={filters.threshold}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      threshold: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mais resultados</span>
                    <span>Mais precisos</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Input
                    placeholder="Ex: estrutura, acabamento..."
                    value={filters.categoria || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      categoria: e.target.value || undefined 
                    }))}
                  />
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Sugestões de Busca */}
      {searchSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sugestões Relacionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={searchLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {hasError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <X className="h-4 w-4" />
              <span className="font-medium">Erro na busca:</span>
              <span>{lastError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados da Busca */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados da Busca</span>
              <Badge variant="secondary">
                {searchResults.length} encontrados
              </Badge>
            </CardTitle>
            {lastSearchQuery && (
              <CardDescription>
                Busca por: "{lastSearchQuery}"
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <Card 
                  key={`${result.tipo}-${result.id}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedResult?.id === result.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleResultSelect(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={result.tipo === 'insumo' ? 'default' : 'secondary'}>
                            {result.tipo === 'insumo' ? 'Insumo' : 'Composição'}
                          </Badge>
                          <Badge 
                            variant={getSimilarityBadgeVariant(result.similarity_score)}
                            className="text-xs"
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {(result.similarity_score * 100).toFixed(0)}%
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {result.codigo_sinapi}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">
                          {result.descricao}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Unidade: {result.unidade}</span>
                          {result.categoria && (
                            <span>Categoria: {result.categoria}</span>
                          )}
                          {result.preco_referencia && (
                            <span className="font-medium text-green-600">
                              {formatPrice(result.preco_referencia)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExplainResult(result);
                          }}
                          disabled={explainLoading}
                        >
                          {explainLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Info className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes do Resultado Selecionado */}
      {selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes do Item</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResult(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Informações Básicas</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Código:</strong> {selectedResult.codigo_sinapi}</div>
                  <div><strong>Tipo:</strong> {selectedResult.tipo === 'insumo' ? 'Insumo' : 'Composição'}</div>
                  <div><strong>Unidade:</strong> {selectedResult.unidade}</div>
                  {selectedResult.categoria && (
                    <div><strong>Categoria:</strong> {selectedResult.categoria}</div>
                  )}
                  {selectedResult.preco_referencia && (
                    <div><strong>Preço:</strong> {formatPrice(selectedResult.preco_referencia)}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Análise de Similaridade</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Score de Similaridade:</strong>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${selectedResult.similarity_score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">
                        {(selectedResult.similarity_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {selectedResult.metadata && (
                    <div><strong>Fonte:</strong> {selectedResult.metadata.fonte}</div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Descrição Completa</h4>
              <p className="text-sm text-muted-foreground">
                {selectedResult.descricao}
              </p>
            </div>

            {selectedResult.explanation && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Explicação da IA</h4>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    {selectedResult.explanation}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio */}
      {!searchLoading && searchResults.length === 0 && lastSearchQuery && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar os filtros ou usar termos diferentes
            </p>
            <Button variant="outline" onClick={handleClearSearch}>
              Nova Busca
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}