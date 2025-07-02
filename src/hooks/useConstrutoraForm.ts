import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ConstrutoraPJFormValues, ConstrutoraPFFormValues } from '@/lib/validations/construtora';
import { construtoraPJSchema, construtoraPFSchema } from '@/lib/validations/construtora';

// Usar os tipos já definidos no arquivo de validações
export type FormDataPJ = ConstrutoraPJFormValues;
export type FormDataPF = ConstrutoraPFFormValues;

interface UseConstrutoraFormProps {
  tipo: 'PJ' | 'PF';
  defaultValues?: Partial<FormDataPJ | FormDataPF>;
}

/**
 * Hook customizado para gerenciar formulários de construtora
 * 
 * Responsabilidades:
 * - Configurar validação com Zod baseada no tipo (PJ/PF)
 * - Gerenciar estado do formulário com react-hook-form
 * - Fornecer métodos de controle e validação
 * - Manter tipagem adequada para cada tipo de formulário
 * 
 * Benefícios:
 * - Centraliza lógica de formulário
 * - Validação tipada e consistente
 * - Reutilização entre componentes
 * - Facilita testes unitários
 */
export const useConstrutoraForm = ({ tipo, defaultValues }: UseConstrutoraFormProps) => {
  const schema = tipo === 'PJ' ? construtoraPJSchema : construtoraPFSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // Valores padrão comuns
      email: '',
      telefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      responsavel_tecnico: '',
      documento_responsavel: '',
      // Valores específicos por tipo
      ...(tipo === 'PJ' ? {
        documento: '',
        nome_razao_social: '',
        nome_fantasia: '',
        inscricao_estadual: '',
      } : {
        nome: '',
        cpf: '',
      }),
      // Valores customizados
      ...defaultValues,
    } as any,
  });

  // Métodos auxiliares para preenchimento automático
  const preencherDadosCNPJ = (dadosCNPJ: any) => {
    if (!dadosCNPJ) return;
    
    const updates: Partial<FormDataPJ> = {};
    
    if (dadosCNPJ.nome) {
      updates.nome_razao_social = dadosCNPJ.nome;
    }
    
    if (dadosCNPJ.fantasia && dadosCNPJ.fantasia !== dadosCNPJ.nome) {
      updates.nome_fantasia = dadosCNPJ.fantasia;
    }
    
    if (dadosCNPJ.email) {
      updates.email = dadosCNPJ.email;
    }
    
    if (dadosCNPJ.telefone) {
      updates.telefone = dadosCNPJ.telefone;
    }
    
    if (dadosCNPJ.cep) {
      updates.cep = dadosCNPJ.cep;
    }
    
    if (dadosCNPJ.logradouro) {
      updates.endereco = dadosCNPJ.logradouro;
    }
    
    if (dadosCNPJ.numero) {
      updates.numero = dadosCNPJ.numero;
    }
    
    if (dadosCNPJ.complemento) {
      updates.complemento = dadosCNPJ.complemento;
    }
    
    if (dadosCNPJ.bairro) {
      updates.bairro = dadosCNPJ.bairro;
    }
    
    if (dadosCNPJ.municipio) {
      updates.cidade = dadosCNPJ.municipio;
    }
    
    if (dadosCNPJ.uf) {
      updates.estado = dadosCNPJ.uf;
    }
    
    // Atualizar campos do formulário
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        form.setValue(key as keyof FormDataPJ, value);
      }
    });
  };

  const limparFormulario = () => {
    form.reset();
  };

  const obterDadosFormulario = () => {
    return form.getValues();
  };

  const validarFormulario = async () => {
    return await form.trigger();
  };

  return {
    form,
    control: form.control,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
    setValue: form.setValue,
    getValues: form.getValues,
    watch: form.watch,
    reset: form.reset,
    trigger: form.trigger,
    // Métodos auxiliares
    preencherDadosCNPJ,
    limparFormulario,
    obterDadosFormulario,
    validarFormulario,
  };
};