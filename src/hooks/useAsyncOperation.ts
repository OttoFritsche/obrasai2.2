import { useCallback,useState } from 'react';

import { useToast } from './use-toast';

export interface AsyncOperationState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface AsyncOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook unificado para gerenciar operações assíncronas
 * Elimina duplicação de estados de loading, error e success
 */
export function useAsyncOperation<T = unknown>(options: AsyncOperationOptions = {}) {
  const { toast } = useToast();
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso!',
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false
    }));

    try {
      const result = await asyncFn();
      
      setState({
        data: result,
        isLoading: false,
        error: null,
        isSuccess: true
      });

      if (showSuccessToast) {
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'default'
        });
      }

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isSuccess: false
      }));

      if (showErrorToast) {
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive'
        });
      }

      onError?.(errorMessage);
      throw error;
    }
  }, [toast, showSuccessToast, showErrorToast, successMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook especializado para operações de CEP
export function useCEPOperation() {
  return useAsyncOperation({
    showErrorToast: true,
    showSuccessToast: false
  });
}

// Hook especializado para operações de formulário
export function useFormOperation() {
  return useAsyncOperation({
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Dados salvos com sucesso!'
  });
}