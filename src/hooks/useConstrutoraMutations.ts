import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useTenantValidation } from '@/hooks/useTenantValidation';
import type {
  ConstrutoraPJFormValues,
  ConstrutoraPFFormValues,
} from '@/lib/validations/construtora';

/**
 * Hook customizado para gerenciar mutations de construtoras (PJ e PF)
 * 
 * Responsabilidades:
 * - Criar construtoras PJ e PF no Supabase
 * - Gerenciar estados de loading e erro
 * - Navegação pós-sucesso
 * - Feedback visual com toast
 * - Validação de tenant_id
 * 
 * Benefícios:
 * - Reutilização da lógica de mutations
 * - Separação de responsabilidades
 * - Facilita testes unitários
 * - Consistência no tratamento de erros
 */
export const useConstrutoraMutations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validTenantId } = useTenantValidation();

  // Mutation para Pessoa Jurídica
  const pjMutation = useMutation({
    mutationFn: async (values: ConstrutoraPJFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      
      // Mapear os dados do formulário para a estrutura da tabela
      const construtoraData = {
        ...values,
        tipo: 'pj',
        tenant_id: validTenantId
      };
      
      const { error } = await supabase
        .from('construtoras')
        .insert([construtoraData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Construtora criada com sucesso!');
      navigate('/dashboard/construtoras');
    },
    onError: (error) => {
      console.error('Erro ao criar construtora PJ:', error);
      toast.error('Erro ao criar construtora. Tente novamente.');
    },
  });

  // Mutation para Pessoa Física
  const pfMutation = useMutation({
    mutationFn: async (values: ConstrutoraPFFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      
      // Mapear os dados do formulário PF para a estrutura da tabela
      const construtoraData = {
        documento: values.cpf, // CPF vai para o campo 'documento'
        nome_razao_social: values.nome, // Nome vai para 'nome_razao_social'
        email: values.email,
        telefone: values.telefone,
        endereco: values.endereco,
        numero: values.numero,
        complemento: values.complemento,
        bairro: values.bairro,
        cidade: values.cidade,
        estado: values.estado,
        cep: values.cep,
        responsavel_tecnico: values.responsavel_tecnico,
        documento_responsavel: values.documento_responsavel,
        tipo: 'pf',
        tenant_id: validTenantId
      };
      
      const { error } = await supabase
        .from('construtoras')
        .insert([construtoraData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Construtor(a) autônomo criado com sucesso!');
      navigate('/dashboard/construtoras');
    },
    onError: (error) => {
      console.error('Erro ao criar construtor PF:', error);
      toast.error('Erro ao criar construtor. Tente novamente.');
    },
  });

  // Handlers para submissão dos formulários
  const handleSubmitPJ = (values: ConstrutoraPJFormValues) => {
    pjMutation.mutate(values);
  };

  const handleSubmitPF = (values: ConstrutoraPFFormValues) => {
    pfMutation.mutate(values);
  };

  return {
    // Mutations
    pjMutation,
    pfMutation,
    
    // Handlers
    handleSubmitPJ,
    handleSubmitPF,
    
    // Estados derivados
    isLoading: pjMutation.isPending || pfMutation.isPending,
    hasValidTenant: !!validTenantId,
  };
};