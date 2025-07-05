import { useCallback, useState } from "react";

import type { SinapiItem} from "./useSinapiDespesas";
import { useSinapiDespesas } from "./useSinapiDespesas";

interface InsumoAnalysisResult {
  sugestoesSinapi: SinapiItem[];
  melhorCorrespondencia: SinapiItem | null;
  isLoading: boolean;
  error: string | null;
}

export const useInsumoAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState<InsumoAnalysisResult>({
    sugestoesSinapi: [],
    melhorCorrespondencia: null,
    isLoading: false,
    error: null,
  });

  const { useBuscarSinapi } = useSinapiDespesas();

  const analisarInsumo = useCallback(async (nomeInsumo: string) => {
    if (!nomeInsumo || nomeInsumo.length < 3) {
      setAnalysisResult({
        sugestoesSinapi: [],
        melhorCorrespondencia: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    setAnalysisResult((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Extrair palavras-chave do nome do insumo
      const palavrasChave = extrairPalavrasChave(nomeInsumo);

      // Buscar por cada palavra-chave
      const resultadosBusca: SinapiItem[] = [];

      for (const palavra of palavrasChave) {
        // Aqui você faria a busca real usando o hook useBuscarSinapi
        // Por enquanto, vamos simular
        // const { data } = useBuscarSinapi(palavra);
        // if (data) resultadosBusca.push(...data);
      }

      // Remover duplicatas baseado no código
      const resultadosUnicos = resultadosBusca.filter((item, index, self) =>
        index === self.findIndex((t) => t.codigo === item.codigo)
      );

      // Encontrar a melhor correspondência baseada na similaridade
      const melhorCorrespondencia = encontrarMelhorCorrespondencia(
        nomeInsumo,
        resultadosUnicos,
      );

      setAnalysisResult({
        sugestoesSinapi: resultadosUnicos.slice(0, 5), // Limitar a 5 sugestões
        melhorCorrespondencia,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAnalysisResult((prev) => ({
        ...prev,
        isLoading: false,
        error: "Erro ao analisar insumo",
      }));
    }
  }, [extrairPalavrasChave, encontrarMelhorCorrespondencia]);

  const extrairPalavrasChave = useCallback((texto: string): string[] => {
    // Remover palavras comuns e extrair termos relevantes
    const palavrasComuns = [
      "de",
      "da",
      "do",
      "para",
      "com",
      "em",
      "a",
      "o",
      "e",
    ];

    return texto
      .toLowerCase()
      .split(/[\s,-]+/)
      .filter((palavra) =>
        palavra.length > 2 &&
        !palavrasComuns.includes(palavra) &&
        !/^\d+$/.test(palavra) // Remover números puros
      )
      .slice(0, 3); // Limitar a 3 palavras-chave
  }, []);

  const encontrarMelhorCorrespondencia = useCallback((
    nomeInsumo: string,
    opcoes: SinapiItem[],
  ): SinapiItem | null => {
    if (opcoes.length === 0) return null;

    // Calcular score de similaridade para cada opção
    const opcoesComScore = opcoes.map((opcao) => ({
      ...opcao,
      score: calcularSimilaridade(
        nomeInsumo.toLowerCase(),
        opcao.descricao.toLowerCase(),
      ),
    }));

    // Ordenar por score e retornar o melhor
    opcoesComScore.sort((a, b) => b.score - a.score);

    // Retornar apenas se o score for razoável (> 0.3)
    return opcoesComScore[0].score > 0.3 ? opcoesComScore[0] : null;
  }, []);

  const calcularSimilaridade = useCallback(
    (str1: string, str2: string): number => {
      // Implementação simples de similaridade baseada em palavras comuns
      const palavras1 = new Set(str1.split(/\s+/));
      const palavras2 = new Set(str2.split(/\s+/));

      const intersecao = new Set(
        [...palavras1].filter((x) => palavras2.has(x)),
      );
      const uniao = new Set([...palavras1, ...palavras2]);

      return intersecao.size / uniao.size;
    },
    [],
  );

  const calcularVariacao = useCallback((
    valorReal: number,
    valorSinapi: number,
  ) => {
    const diferenca = valorReal - valorSinapi;
    const percentual = (diferenca / valorSinapi) * 100;

    return {
      diferenca,
      percentual,
      tipo: diferenca > 0
        ? "acima" as const
        : diferenca < 0
        ? "abaixo" as const
        : "igual" as const,
    };
  }, []);

  const gerarRecomendacoes = useCallback((
    nomeInsumo: string,
    valorReal: number,
    melhorReferencia?: SinapiItem,
  ): string[] => {
    const recomendacoes: string[] = [];

    if (!melhorReferencia) {
      recomendacoes.push(
        "Considere buscar uma referência SINAPI similar para comparação de preços.",
      );
      return recomendacoes;
    }

    const variacao = calcularVariacao(
      valorReal,
      melhorReferencia.preco_unitario,
    );

    if (variacao.tipo === "acima" && Math.abs(variacao.percentual) > 20) {
      recomendacoes.push(
        `O preço está ${
          variacao.percentual.toFixed(1)
        }% acima da referência SINAPI. Considere renegociar com o fornecedor.`,
      );
    } else if (
      variacao.tipo === "abaixo" && Math.abs(variacao.percentual) > 10
    ) {
      recomendacoes.push(
        `Excelente! O preço está ${
          Math.abs(variacao.percentual).toFixed(1)
        }% abaixo da referência SINAPI.`,
      );
    } else {
      recomendacoes.push(
        "O preço está dentro da faixa esperada comparado à referência SINAPI.",
      );
    }

    return recomendacoes;
  }, [calcularVariacao]);

  return {
    analysisResult,
    analisarInsumo,
    calcularVariacao,
    gerarRecomendacoes,
  };
};

export default useInsumoAnalysis;
