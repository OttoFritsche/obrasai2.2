import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Building,
  CalendarDays,
  Check,
  DollarSign,
  Loader2,
  Package,
  Search,
  TrendingUp,
  X
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { SinapiItem } from '@/hooks/useSinapiDespesas';
import { useSinapiDespesas } from '@/hooks/useSinapiDespesas';
import { cn } from '@/lib/utils';

interface SinapiModalSearchProps {
  onSelect: (item: SinapiItem) => void;
  onClose: () => void;
  searchTerm?: string;
  className?: string;
}

export const SinapiModalSearch: React.FC<SinapiModalSearchProps> = ({
  onSelect,
  onClose,
  searchTerm = '',
  className
}) => {
  const [termoBusca, setTermoBusca] = useState(searchTerm);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const { useBuscarSinapi } = useSinapiDespesas();
  
  const { data: resultados, isLoading, error } = useBuscarSinapi(termoBusca);

  // Auto-focus no input quando o modal abre
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Navegação por teclado com auto-scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!resultados || resultados.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const newIndex = prev < resultados.length - 1 ? prev + 1 : 0;
            // Auto-scroll para o item selecionado
            setTimeout(() => {
              const selectedElement = document.querySelector(`[data-index="${newIndex}"]`);
              if (selectedElement && resultsContainerRef.current) {
                selectedElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest' 
                });
              }
            }, 0);
            return newIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : resultados.length - 1;
            // Auto-scroll para o item selecionado
            setTimeout(() => {
              const selectedElement = document.querySelector(`[data-index="${newIndex}"]`);
              if (selectedElement && resultsContainerRef.current) {
                selectedElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest' 
                });
              }
            }, 0);
            return newIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && resultados[selectedIndex]) {
            handleSelectItem(resultados[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resultados, selectedIndex, onClose]);

  const handleSelectItem = (item: SinapiItem) => {
    onSelect(item);
    onClose();
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getFonteBadgeColor = (fonte: string) => {
    switch (fonte.toLowerCase()) {
      case 'dados_oficiais':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'insumos':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'composicoes':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getFonteLabel = (fonte: string) => {
    switch (fonte.toLowerCase()) {
      case 'dados_oficiais':
        return 'Oficial';
      case 'insumos':
        return 'Insumos';
      case 'composicoes':
        return 'Composições';
      default:
        return fonte;
    }
  };

  const getFonteIcon = (fonte: string) => {
    switch (fonte.toLowerCase()) {
      case 'dados_oficiais':
        return <Building className="h-3 w-3" />;
      case 'insumos':
        return <Package className="h-3 w-3" />;
      case 'composicoes':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  };

  const getVariacaoColor = (preco: number) => {
    if (preco > 100) return 'text-red-600 dark:text-red-400';
    if (preco > 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className={cn('h-full max-h-full overflow-hidden', className)}>
      {/* Header com busca */}
      <div className="p-6 pb-4 border-b bg-background">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              Buscar Referência SINAPI
            </h2>
            <p className="text-sm text-muted-foreground">
              Pesquise por materiais, insumos ou composições
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Campo de busca moderno */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Digite o material que você procura (ex: cimento, areia, tijolo...)"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 pr-12 h-12 text-base bg-background/50 border-2 focus:border-blue-500 transition-colors"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
          )}
          {termoBusca && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTermoBusca('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Dicas de busca */}
        {termoBusca.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Exemplos:</span>
            {['cimento', 'areia lavada', 'tijolo cerâmico', 'ferro'].map((exemplo) => (
              <Button
                key={exemplo}
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setTermoBusca(exemplo)}
              >
                {exemplo}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div 
        ref={resultsContainerRef}
        className="overflow-y-auto"
        style={{ height: 'calc(100% - 200px)', maxHeight: 'calc(80vh - 200px)' }}
      >
          <div className="p-6 pt-4 space-y-4">
            {/* Estado de carregamento */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-sm text-muted-foreground">
                    Buscando na base SINAPI...
                  </p>
                </div>
              </div>
            )}

            {/* Estado de erro */}
            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4 max-w-md">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Erro na busca</p>
                    <p className="text-sm text-muted-foreground">
                      Não foi possível conectar com a base SINAPI. Tente novamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nenhum resultado */}
            {!isLoading && !error && resultados && resultados.length === 0 && termoBusca.length >= 3 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4 max-w-md">
                  <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-full w-fit mx-auto">
                    <Package className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Nenhum resultado encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      Tente usar termos mais genéricos como "cimento" ou "areia"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instrução inicial */}
            {termoBusca.length > 0 && termoBusca.length < 3 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4 max-w-md">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Continue digitando...</p>
                    <p className="text-sm text-muted-foreground">
                      Digite pelo menos 3 caracteres para iniciar a busca
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de resultados */}
            {!isLoading && !error && resultados && resultados.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {resultados.length} resultado{resultados.length > 1 ? 's' : ''} encontrado{resultados.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use ↑↓ para navegar, Enter para selecionar
                  </p>
                </div>

                <div className="space-y-3 pb-6">
                  <AnimatePresence>
                    {resultados.map((item, index) => (
                    <motion.div
                      key={`${item.codigo}-${index}`}
                      data-index={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-md',
                          'border-2 hover:border-blue-200 dark:hover:border-blue-800',
                          selectedIndex === index && 'border-blue-500 dark:border-blue-400 shadow-lg'
                        )}
                        onClick={() => handleSelectItem(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Ícone e código */}
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                {getFonteIcon(item.fonte)}
                              </div>
                            </div>

                            {/* Conteúdo principal */}
                            <div className="flex-1 min-w-0">
                              {/* Header com badges */}
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {item.codigo}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn('text-xs', getFonteBadgeColor(item.fonte))}
                                >
                                  {getFonteIcon(item.fonte)}
                                  <span className="ml-1">{getFonteLabel(item.fonte)}</span>
                                </Badge>
                                {item.estado && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.estado}
                                  </Badge>
                                )}
                              </div>

                              {/* Descrição */}
                              <h3 className="font-medium text-foreground leading-tight mb-2">
                                {item.descricao}
                              </h3>

                              {/* Footer com preço e data */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className={cn('font-semibold', getVariacaoColor(item.preco_unitario))}>
                                      {formatarPreco(item.preco_unitario)}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      / {item.unidade}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {item.data_referencia && (
                                    <>
                                      <CalendarDays className="h-3 w-3" />
                                      <span>
                                        {new Date(item.data_referencia).toLocaleDateString('pt-BR')}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Botão de seleção */}
                            <div className="flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                              >
                                {selectedIndex === index ? (
                                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default SinapiModalSearch;