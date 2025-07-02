import React, { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { SinapiItem } from '@/hooks/useSinapiDespesas';
import { useSinapiDespesas } from '@/hooks/useSinapiDespesas'

interface SinapiSelectorDespesasProps {
  onSelect: (item: SinapiItem) => void
  estado?: string
  valorAtual?: number
}

export const SinapiSelectorDespesas: React.FC<SinapiSelectorDespesasProps> = ({
  onSelect,
  estado = 'SP',
  valorAtual
}) => {
  const [termo, setTermo] = useState('')
  const [mostrarResultados, setMostrarResultados] = useState(false)
  
  const { itens, isLoading, setFiltros, calcularVariacao } = useSinapiDespesas()
  
  const handleSearch = (value: string) => {
    setTermo(value)
    setFiltros({ termo: value, estado })
    setMostrarResultados(value.length > 2)
  }
  
  const handleSelect = (item: SinapiItem) => {
    onSelect(item)
    setMostrarResultados(false)
    setTermo('')
  }
  
  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 5) return <TrendingUp className="w-4 h-4 text-destructive" />
    if (variacao < -5) return <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar insumo SINAPI (código ou descrição)..."
          value={termo}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {mostrarResultados && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto bg-card dark:bg-card shadow-md">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Buscando...
              </div>
            ) : itens.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum item encontrado
              </div>
            ) : (
              itens.map((item, index) => {
                const variacao = valorAtual ? calcularVariacao(valorAtual, item.preco_unitario) : 0
                
                return (
                  <div
                    key={`${item.codigo}-${index}`}
                    className="p-3 hover:bg-muted/50 dark:hover:bg-muted/30 cursor-pointer border-b last:border-b-0 transition-colors"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.codigo}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.fonte}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {item.descricao}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Unidade: {item.unidade}</span>
                          <span>Categoria: {item.categoria}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          R$ {item.preco_unitario.toFixed(2)}
                        </div>
                        {valorAtual && (
                          <div className="flex items-center gap-1 text-xs">
                            {getVariacaoIcon(variacao)}
                            <span className={variacao > 5 ? 'text-destructive' : variacao < -5 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}