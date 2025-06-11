import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DocumentationContext {
  contratos: string;
  obras: string;
  despesas: string;
  orcamentos: string;
}

export const useAIChatContextual = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Mapeamento dos contextos de documentação
  const documentationPaths: DocumentationContext = {
    contratos: '/docs/contrato/documentacao_contratoIA.md',
    obras: '/docs/obras/documentacao_obras.md', 
    despesas: '/docs/despesas/documentacao_despesas.md',
    orcamentos: '/docs/orcamentoIA/documentacao_orcamento.md'
  };

  const sendMessage = async (message: string, pageContext: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Buscar documentação relevante
      const docPath = documentationPaths[pageContext as keyof DocumentationContext];
      
      // Chamar Edge Function com contexto
      const { data, error } = await supabase.functions.invoke('ai-chat-contextual', {
        body: {
          message,
          pageContext,
          documentationPath: docPath
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.response || 'Desculpe, não consegui processar sua pergunta.';
    } catch (error) {
      console.error('Erro no chat IA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};