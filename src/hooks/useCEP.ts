import { supabase } from '@/integrations/supabase/client';

import { useCEPOperation } from './useAsyncOperation';

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
  const asyncOperation = useCEPOperation();

  /**
   * Busca informações de endereço pelo CEP
   * @param cep - CEP a ser consultado (pode estar formatado ou não)
   * @returns Dados do endereço ou null em caso de erro
   */
  const buscarCEP = async (cep: string): Promise<CEPData | null> => {
    if (!cep || cep.length < 8) {
      throw new Error('CEP deve ter pelo menos 8 dígitos');
    }

    return await asyncOperation.execute(async () => {
      // Chama a Edge Function de validação de documentos
      const { data, error: functionError } = await supabase.functions.invoke('document-validator', {
        body: {
          documento: cep,
          tipo: 'cep'
        }
      });

      if (functionError) {
        console.error('Erro na Edge Function:', functionError);
        throw new Error('Erro ao consultar CEP. Tente novamente.');
      }

      const response = data as CEPResponse;

      if (!response.valido) {
        throw new Error(response.erro || 'CEP inválido');
      }

      if (response.dados) {
        return response.dados;
      }

      throw new Error('Dados do CEP não encontrados');
    });
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
    isLoading: asyncOperation.isLoading,
    error: asyncOperation.error,
    data: asyncOperation.data,
    reset: asyncOperation.reset
  };
};