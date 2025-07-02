import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook genérico para mutações de formulário com padrões comuns
 * Elimina duplicação de código em formulários CRUD
 */
export interface UseFormMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables, tenantId: string) => Promise<TData>;
  queryKey?: string | string[];
  successMessage?: string;
  errorMessage?: string;
  redirectTo?: string;
  onSuccessCallback?: (data: TData, variables: TVariables) => void;
  onErrorCallback?: (error: Error) => void;
}

export function useFormMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  successMessage = 'Operação realizada com sucesso!',
  errorMessage = 'Erro ao realizar operação',
  redirectTo,
  onSuccessCallback,
  onErrorCallback,
}: UseFormMutationOptions<TData, TVariables>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Validação de tenantId reutilizável
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  const mutation = useMutation({
    mutationFn: (variables: TVariables) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return mutationFn(variables, validTenantId);
    },
    onSuccess: (data, variables) => {
      toast.success(successMessage);
      
      // Invalidar queries relacionadas
      if (queryKey) {
        if (Array.isArray(queryKey)) {
          queryKey.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      }
      
      // Callback personalizado
      onSuccessCallback?.(data, variables);
      
      // Redirecionamento
      if (redirectTo) {
        navigate(redirectTo);
      }
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(errorMessage);
      onErrorCallback?.(error);
    },
  });

  return {
    ...mutation,
    validTenantId,
  };
}