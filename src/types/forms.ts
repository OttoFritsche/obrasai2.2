import type { UseFormReturn } from 'react-hook-form';

// Tipos para formulários
export interface BaseFormData {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DespesaFormData extends BaseFormData {
  obra_id: string;
  descricao: string;
  data_despesa: Date | string;
  quantidade: number;
  valor_unitario: number;
  valor_total?: number;
  categoria?: string;
  observacoes?: string;
  fornecedor_id?: string;
  nota_fiscal?: string;
}

export interface ObraFormData extends BaseFormData {
  nome: string;
  descricao?: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  data_inicio: Date | string;
  data_previsao_fim?: Date | string;
  data_fim?: Date | string;
  orcamento_inicial?: number;
  orcamento_atual?: number;
  status: 'planejamento' | 'em_andamento' | 'concluida' | 'pausada';
  construtora_id?: string;
  responsavel_tecnico?: string;
  observacoes?: string;
}

export interface ContratoFormData extends BaseFormData {
  obra_id: string;
  fornecedor_id: string;
  tipo_contrato: 'servico' | 'fornecimento' | 'empreitada';
  valor_total: number;
  data_inicio: Date | string;
  data_fim: Date | string;
  status: 'rascunho' | 'pendente' | 'assinado' | 'executando' | 'concluido' | 'cancelado';
  observacoes?: string;
  clausulas_especiais?: string;
}

export interface FornecedorPJFormData extends BaseFormData {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  telefone?: string;
  email?: string;
  contato_responsavel?: string;
  observacoes?: string;
}

export interface FornecedorPFFormData extends BaseFormData {
  nome: string;
  cpf: string;
  rg?: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  telefone?: string;
  email?: string;
  especialidade?: string;
  observacoes?: string;
}

export interface NotaFiscalFormData extends BaseFormData {
  obra_id: string;
  fornecedor_id: string;
  numero_nota: string;
  serie?: string;
  data_emissao: Date | string;
  valor_total: number;
  valor_impostos?: number;
  descricao: string;
  arquivo_url?: string;
  status: 'pendente' | 'validada' | 'rejeitada';
  observacoes?: string;
}

// Tipos para props de formulários
export interface BaseFormProps<T> {
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<T>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export interface FormWrapperProps<T = Record<string, unknown>> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  className?: string;
}

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface SelectFieldProps extends FormFieldProps {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
}

export interface DateFieldProps extends FormFieldProps {
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
}

export interface NumberFieldProps extends FormFieldProps {
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  currency?: boolean;
}

export interface TextAreaFieldProps extends FormFieldProps {
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export interface FileFieldProps extends FormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFileSelect?: (files: File[]) => void;
}

// Tipos para validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FormValidationContext {
  mode: 'create' | 'edit';
  userId?: string;
  tenantId?: string;
  existingData?: Record<string, unknown>;
}