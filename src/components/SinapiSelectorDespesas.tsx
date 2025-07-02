import React, { useState, useEffect } from 'react';
import { Search, Loader2, Package, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SinapiItem } from '@/hooks/useSinapiDespesas';
import { useSinapiDespesas } from '@/hooks/useSinapiDespesas';
import { cn } from '@/lib/utils';

interface SinapiSelectorDespesasProps {
  onSelect: (item: SinapiItem) => void;
  selectedItem?: SinapiItem | null;
  placeholder?: string;
  className?: string;
}

export const SinapiSelectorDespesas: React.FC<SinapiSelectorDespesasProps> = ({
  onSelect,
  selectedItem,
  placeholder = "Buscar item SINAPI (ex: cimento, areia, tijolo...)",
  className
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const { useBuscarSinapi } = useSinapiDespesas();
  
  const { data: resultados, isLoading, error } = useBuscarSinapi(termoBusca);

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.sinapi-selector')) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setTermoBusca(value);
    setMostrarResultados(value.length >= 3);
  };

  const handleSelectItem = (item: SinapiItem) => {
    onSelect(item);
    setMostrarResultados(false);
    setTermoBusca('');
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'insumos':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'composicoes':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className={cn('sinapi-selector relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={termoBusca}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => termoBusca.length >= 3 && setMostrarResultados(true)}
          className="pl-10 bg-background/50"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Resultados da busca */}
      {mostrarResultados && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto border-border/50 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-2">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Erro ao buscar dados SINAPI
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            )}
            
            {!isLoading && !error && resultados && resultados.length === 0 && termoBusca.length >= 3 && (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                Nenhum item encontrado
              </div>
            )}
            
            {!isLoading && !error && resultados && resultados.length > 0 && (
              <div className="space-y-1">
                {resultados.map((item, index) => (
                  <Button
                    key={`${item.codigo}-${index}`}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left hover:bg-muted/50"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {item.codigo}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getFonteBadgeColor(item.fonte))}
                        >
                          {getFonteLabel(item.fonte)}
                        </Badge>
                        {item.estado && (
                          <Badge variant="outline" className="text-xs">
                            {item.estado}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {item.descricao}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatarPreco(item.preco_unitario)} / {item.unidade}</span>
                        {item.data_referencia && (
                          <span>Ref: {new Date(item.data_referencia).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            {termoBusca.length > 0 && termoBusca.length < 3 && (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Digite pelo menos 3 caracteres para buscar
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SinapiSelectorDespesas;