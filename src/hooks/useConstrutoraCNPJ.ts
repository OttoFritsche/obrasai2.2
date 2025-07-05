import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { useCNPJLookup } from '@/hooks/useCNPJLookup';
import { formatCEP, isComplete } from '@/lib/utils/formatters';
import type { ConstrutoraPJFormValues } from '@/lib/validations/construtora';

/**
 * Hook customizado para gerenciar lookup de CNPJ e preenchimento automático
 * 
 * Responsabilidades:
 * - Monitorar mudanças no campo CNPJ
 * - Realizar busca automática com debounce
 * - Preencher campos automaticamente
 * - Gerenciar estado de loading do CNPJ
 * - Evitar buscas duplicadas
 * 
 * Benefícios:
 * - Isolamento da lógica complexa de CNPJ
 * - Reutilização em outros formulários
 * - Facilita testes da lógica de lookup
 * - Melhora a legibilidade do componente principal
 */
export const useConstrutoraCNPJ = (form: UseFormReturn<ConstrutoraPJFormValues>) => {
  const { lookupCNPJ, isLoading: isLoadingCNPJ, data: cnpjData, reset: resetCNPJ } = useCNPJLookup();
  const filledFromCNPJRef = useRef<string | null>(null);
  
  // Watch do campo CNPJ para busca automática
  const documentoValue = form.watch('documento');

  // Efeito para busca automática com debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        documentoValue && 
        isComplete(documentoValue, 'cnpj') && 
        filledFromCNPJRef.current !== documentoValue
      ) {
        const data = await lookupCNPJ(documentoValue);
        if (data) {
          fillFormWithCNPJData(data);
          filledFromCNPJRef.current = documentoValue;
          toast.success('Campos preenchidos automaticamente pelo CNPJ!');
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [documentoValue, lookupCNPJ, form]);

  // Efeito para limpar referência quando CNPJ não está completo
  useEffect(() => {
    if (!documentoValue || !isComplete(documentoValue, 'cnpj')) {
      filledFromCNPJRef.current = null;
    }
  }, [documentoValue]);

  // Função para preencher formulário com dados do CNPJ
  const fillFormWithCNPJData = (data: any) => {
    // Dados principais
    form.setValue('nome_razao_social', data.razao_social);
    form.setValue('nome_fantasia', data.nome_fantasia || '');
    
    // Contato
    if (data.email) form.setValue('email', data.email);
    if (data.telefone_principal) form.setValue('telefone', data.telefone_principal);
    
    // Endereço
    if (data.endereco) {
      const { endereco } = data;
      if (endereco.logradouro) form.setValue('endereco', endereco.logradouro);
      if (endereco.numero) form.setValue('numero', endereco.numero);
      if (endereco.complemento) form.setValue('complemento', endereco.complemento);
      if (endereco.bairro) form.setValue('bairro', endereco.bairro);
      if (endereco.municipio) form.setValue('cidade', endereco.municipio);
      if (endereco.uf) form.setValue('estado', endereco.uf);
      if (endereco.cep) form.setValue('cep', formatCEP(endereco.cep));
    }
  };

  // Função para busca manual do CNPJ
  const handleManualCNPJLookup = async () => {
    const documentoValue = form.getValues('documento');
    if (documentoValue) {
      const data = await lookupCNPJ(documentoValue);
      if (data) {
        fillFormWithCNPJData(data);
        filledFromCNPJRef.current = documentoValue;
        toast.success('Campos preenchidos manualmente pelo CNPJ!');
      }
    }
  };

  // Função para resetar dados do CNPJ
  const handleResetCNPJ = () => {
    resetCNPJ();
    filledFromCNPJRef.current = null;
  };

  return {
    // Estados
    isLoadingCNPJ,
    cnpjData,
    documentoValue,
    
    // Funções
    handleManualCNPJLookup,
    handleResetCNPJ,
    
    // Estados derivados
    isCNPJComplete: documentoValue && isComplete(documentoValue, 'cnpj'),
    isCNPJActive: cnpjData?.situacao_ativa,
    showSearchButton: documentoValue && isComplete(documentoValue, 'cnpj') && !isLoadingCNPJ,
  };
};