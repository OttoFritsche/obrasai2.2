import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowDown, ArrowUp, Minus, AlertTriangle, Search } from "lucide-react";
import { SinapiItem } from "@/hooks/useSinapiDespesas";
import useInsumoAnalysis from "@/hooks/useInsumoAnalysis";

interface InsumoAnalysisCardProps {
  insumoCustomizado: string;
  valorUnitario: number;
  unidade?: string;
  sinapiReferencia?: SinapiItem;
  onBuscarSinapi?: () => void;
}

export function InsumoAnalysisCard({
  insumoCustomizado,
  valorUnitario,
  unidade,
  sinapiReferencia: propsSinapiReferencia,
  onBuscarSinapi
}: InsumoAnalysisCardProps) {
  const { analysisResult, analisarInsumo, calcularVariacao, gerarRecomendacoes } = useInsumoAnalysis();
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  
  // Usar referência fornecida via props ou a melhor correspondência encontrada pelo hook
  const sinapiReferencia = propsSinapiReferencia || analysisResult.melhorCorrespondencia;

  // ✅ Memoizar função de análise para evitar loop infinito
  const handleAnalisarInsumo = useCallback(async () => {
    if (insumoCustomizado && insumoCustomizado.length >= 3 && !propsSinapiReferencia) {
      await analisarInsumo(insumoCustomizado);
    }
  }, [insumoCustomizado, propsSinapiReferencia, analisarInsumo]);

  // ✅ Memoizar função de recomendações
  const handleGerarRecomendacoes = useCallback(() => {
    if (insumoCustomizado && valorUnitario > 0) {
      const novasRecomendacoes = gerarRecomendacoes(insumoCustomizado, valorUnitario, sinapiReferencia);
      setRecomendacoes(novasRecomendacoes);
    }
  }, [insumoCustomizado, valorUnitario, sinapiReferencia, gerarRecomendacoes]);

  // ✅ Analisar insumo quando necessário (dependências otimizadas)
  useEffect(() => {
    handleAnalisarInsumo();
  }, [handleAnalisarInsumo]);

  // ✅ Gerar recomendações quando os dados mudarem (dependências otimizadas)
  useEffect(() => {
    handleGerarRecomendacoes();
  }, [handleGerarRecomendacoes]);

  // Calcular variação se houver referência SINAPI
  const variacao = sinapiReferencia ? 
    calcularVariacao(valorUnitario, sinapiReferencia.preco_unitario) : 
    null;

  // ✅ Não renderizar se não houver insumo customizado
  if (!insumoCustomizado || insumoCustomizado.length < 3) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Análise de Insumo Manual</CardTitle>
        <CardDescription>
          Comparação com referências SINAPI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysisResult.isLoading ? (
          <div className="flex justify-center items-center py-6">
            <p>Analisando insumo...</p>
          </div>
        ) : sinapiReferencia ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Insumo Manual</h4>
                <p className="text-sm text-muted-foreground">{insumoCustomizado}</p>
                <p className="mt-1">
                  <span className="font-bold">R$ {valorUnitario.toFixed(2)}</span>
                  {unidade && <span className="text-sm text-muted-foreground ml-2">/{unidade}</span>}
                </p>
              </div>
              <div className="text-right">
                <h4 className="font-medium">Referência SINAPI</h4>
                <p className="text-sm text-muted-foreground">{sinapiReferencia.descricao}</p>
                <p className="mt-1">
                  <span className="font-bold">R$ {sinapiReferencia.preco_unitario.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground ml-2">/{sinapiReferencia.unidade}</span>
                </p>
              </div>
            </div>

            {variacao && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Variação</h4>
                  <Badge 
                    variant={variacao.tipo === 'acima' ? 'destructive' : 
                            variacao.tipo === 'abaixo' ? 'success' : 'outline'}
                    className="flex items-center gap-1"
                  >
                    {variacao.tipo === 'acima' && <ArrowUp className="h-3 w-3" />}
                    {variacao.tipo === 'abaixo' && <ArrowDown className="h-3 w-3" />}
                    {variacao.tipo === 'igual' && <Minus className="h-3 w-3" />}
                    {Math.abs(variacao.percentual).toFixed(1)}%
                  </Badge>
                </div>
                <div className="mt-2 text-sm">
                  <p>
                    {variacao.tipo === 'acima' && (
                      <>Valor <span className="font-medium text-destructive">acima</span> da referência SINAPI em R$ {variacao.diferenca.toFixed(2)}</>
                    )}
                    {variacao.tipo === 'abaixo' && (
                      <>Valor <span className="font-medium text-green-600">abaixo</span> da referência SINAPI em R$ {Math.abs(variacao.diferenca).toFixed(2)}</>
                    )}
                    {variacao.tipo === 'igual' && (
                      <>Valor <span className="font-medium">igual</span> à referência SINAPI</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-center">
              <h4 className="font-medium">Sem referência SINAPI</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Não foi possível encontrar uma referência SINAPI para este insumo manual.
              </p>
            </div>
            {onBuscarSinapi && (
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={onBuscarSinapi}
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar referência SINAPI
              </Button>
            )}
          </div>
        )}
      </CardContent>
      {sinapiReferencia && recomendacoes.length > 0 && (
        <CardFooter className="flex flex-col items-start border-t px-6 py-4">
          <h4 className="font-medium">Recomendação</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {recomendacoes[0]}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}