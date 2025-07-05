import { useCallback,useState } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

// Interface para os dados do CNPJ
export interface SimplifiedCNPJData {
  razao_social: string;
  nome_fantasia: string;
  email?: string;
  telefone_principal?: string;
  situacao_ativa: boolean;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
}

// Interface para resposta da Edge Function
interface CNPJLookupResponse {
  success: boolean;
  data?: SimplifiedCNPJData;
  source?: 'cache' | 'api';
  error?: string;
}

// Cache local para evitar requisições desnecessárias
const localCache = new Map<string, SimplifiedCNPJData>();
const requestHistory = new Map<string, number>();

export const useCNPJLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SimplifiedCNPJData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Função para limpar formatação do CNPJ
  const cleanCNPJ = (cnpj: string): string => {
    return cnpj.replace(/\D/g, '');
  };

  // Função para validar CNPJ localmente (evita chamadas desnecessárias)
  const isValidCNPJ = useCallback((cnpj: string): boolean => {
    const cleaned = cleanCNPJ(cnpj);
    
    if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
      return false;
    }
    
    // Algoritmo de validação do CNPJ
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cleaned[12]) !== digit1) return false;
    
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cleaned[13]) === digit2;
  }, []);

  // Função para verificar rate limiting local
  const canMakeRequest = (cnpj: string): boolean => {
    const now = Date.now();
    const lastRequest = requestHistory.get(cnpj);
    
    // Permitir apenas 1 requisição por CNPJ a cada 5 segundos
    if (lastRequest && now - lastRequest < 5000) {
      return false;
    }
    
    return true;
  };

  // Função principal para consultar CNPJ - usando useCallback para evitar recriações
  const lookupCNPJ = useCallback(async (cnpj: string): Promise<SimplifiedCNPJData | null> => {
    const cleaned = cleanCNPJ(cnpj);
    
    // Validar CNPJ antes de fazer qualquer consulta
    if (!isValidCNPJ(cleaned)) {
      const errorMsg = 'CNPJ inválido. Verifique os dados informados.';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    // Verificar cache local primeiro
    if (localCache.has(cleaned)) {
      const cachedData = localCache.get(cleaned)!;
      setData(cachedData);
      toast.success('Dados encontrados no cache local!');
      return cachedData;
    }

    // Verificar rate limiting
    if (!canMakeRequest(cleaned)) {
      toast.warning('Aguarde alguns segundos antes de tentar novamente.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      console.log('🔍 Consultando CNPJ via Edge Function:', cleaned);
      requestHistory.set(cleaned, Date.now());

      let response = null;
      let functionError = null;

      // Tentar primeiro com autenticação (cnpj-lookup)
      try {
        const result = await supabase.functions.invoke('cnpj-lookup', {
          body: { cnpj: cleaned }
        });
        response = result.data;
        functionError = result.error;
      } catch (authError) {
        console.warn('Falha na consulta autenticada, tentando sem autenticação...');
        
        // Se falhar com autenticação, tentar chamada HTTP direta
        try {
          const directResponse = await fetch('https://anrphijuostbgbscxmzx.supabase.co/functions/v1/cnpj-lookup-public', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cnpj: cleaned })
          });

          if (!directResponse.ok) {
            throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
          }

          response = await directResponse.json();
        } catch (directError) {
          console.error('❌ Falha na consulta direta:', directError);
          throw new Error(`Erro na consulta: ${directError instanceof Error ? directError.message : 'Erro desconhecido'}`);
        }
      }

      if (functionError) {
        throw new Error(`Erro na função: ${functionError.message}`);
      }

      const cnpjResponse = response as CNPJLookupResponse;

      if (!cnpjResponse.success || !cnpjResponse.data) {
        throw new Error(cnpjResponse.error || 'Erro desconhecido na consulta');
      }

      // Salvar no cache local
      localCache.set(cleaned, cnpjResponse.data);
      setData(cnpjResponse.data);
      
      // Feedback para o usuário
      if (cnpjResponse.source === 'cache') {
        toast.success('Dados encontrados no cache do servidor!');
      } else {
        if (cnpjResponse.data.situacao_ativa) {
          toast.success('Dados do CNPJ encontrados e preenchidos automaticamente!');
        } else {
          toast.warning('Empresa encontrada mas pode estar inativa. Verifique os dados.');
        }
      }
      
      return cnpjResponse.data;

    } catch (err) {
      console.error('❌ Erro na consulta CNPJ:', err);
      
      let errorMessage = 'Erro desconhecido ao consultar CNPJ';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Mensagens de erro específicas para melhor UX
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        toast.error('Muitas requisições. Aguarde alguns minutos e tente novamente.');
      } else if (errorMessage.includes('404') || errorMessage.includes('não encontrado')) {
        toast.error('CNPJ não encontrado nos registros da Receita Federal.');
      } else if (errorMessage.includes('timeout')) {
        toast.error('Consulta demorou muito para responder. Tente novamente.');
      } else if (errorMessage.includes('network') || errorMessage.includes('conectividade')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error(`Erro ao consultar CNPJ: ${errorMessage}`);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isValidCNPJ]); // Adicionar isValidCNPJ como dependência

  // Função para resetar o estado
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Função para limpar cache (útil para debugging)
  const clearCache = useCallback(() => {
    localCache.clear();
    requestHistory.clear();
    toast.info('Cache limpo com sucesso!');
  }, []);

  return {
    lookupCNPJ,
    isLoading,
    data,
    error,
    reset,
    clearCache,
    isValidCNPJ,
    // Estatísticas úteis para debugging
    cacheSize: localCache.size,
    hasCache: (cnpj: string) => localCache.has(cleanCNPJ(cnpj)),
  };
};