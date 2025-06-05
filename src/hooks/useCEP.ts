import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface CEPResponse {
  valido: boolean;
  dados?: CEPData;
  formatado?: string;
  erro?: string;
  tipo?: string;
}

export const useCEP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca informações de endereço pelo CEP
   * @param cep - CEP a ser consultado (pode estar formatado ou não)
   * @returns Dados do endereço ou null em caso de erro
   */
  const buscarCEP = async (cep: string): Promise<CEPData | null> => {
    if (!cep || cep.length < 8) {
      setError('CEP deve ter pelo menos 8 dígitos');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Chama a Edge Function de validação de documentos
      const { data, error: functionError } = await supabase.functions.invoke('document-validator', {
        body: {
          documento: cep,
          tipo: 'cep'
        }
      });

      if (functionError) {
        console.error('Erro na Edge Function:', functionError);
        setError('Erro ao consultar CEP. Tente novamente.');
        return null;
      }

      const response = data as CEPResponse;

      if (!response.valido) {
        setError(response.erro || 'CEP inválido');
        return null;
      }

      if (response.dados) {
        return response.dados;
      }

      setError('Dados do CEP não encontrados');
      return null;

    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setError('Erro ao consultar CEP. Verifique sua conexão.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Formata CEP para o padrão 00000-000
   * @param cep - CEP sem formatação
   * @returns CEP formatado
   */
  const formatarCEP = (cep: string): string => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  };

  /**
   * Remove formatação do CEP
   * @param cep - CEP formatado
   * @returns CEP apenas com números
   */
  const limparCEP = (cep: string): string => {
    return cep.replace(/\D/g, '');
  };

  return {
    buscarCEP,
    formatarCEP,
    limparCEP,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}; 