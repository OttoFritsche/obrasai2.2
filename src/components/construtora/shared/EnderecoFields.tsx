import { MapPin } from 'lucide-react';
import type { Control, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { brazilianStates } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { formatCEP } from '@/lib/utils/formatters';
import type { CNPJApiResponse } from '@/types/api';

// Constraint para garantir que o formulário tenha os campos de endereço
interface AddressFormValues extends FieldValues {
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface EnderecoFieldsProps<T extends AddressFormValues> {
  control: Control<T>;
  isLoading?: boolean;
  cnpjData?: CNPJApiResponse | null;
  fieldPrefix?: string;
}

/**
 * Componente reutilizável para campos de endereço
 * 
 * Responsabilidades:
 * - Renderizar campos de endereço padronizados
 * - Aplicar formatação automática (CEP)
 * - Fornecer feedback visual baseado em dados externos
 * - Manter consistência entre formulários PJ e PF
 * 
 * Benefícios:
 * - Elimina duplicação de código
 * - Garante consistência visual
 * - Facilita manutenção dos campos de endereço
 * - Permite reutilização em outros formulários
 */
export const EnderecoFields = <T extends AddressFormValues>({
  control,
  isLoading = false,
  cnpjData,
  fieldPrefix = ''
}: EnderecoFieldsProps<T>) => {
  const getFieldName = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;
  
  const getFieldClassName = (hasData = false) => {
    return cn(
      'bg-background/50 focus:bg-background transition-colors',
      hasData && cnpjData && 'border-blue-200 dark:border-blue-800'
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Endereço
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CEP */}
        <FormField
          control={control}
          name={getFieldName('cep')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  placeholder="00000-000"
                  {...field}
                  value={formatCEP(field.value || '')}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    field.onChange(formatted);
                  }}
                  className={getFieldClassName(!!cnpjData?.endereco?.cep)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Logradouro */}
        <FormField
          control={control}
          name={getFieldName('endereco')}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Logradouro</FormLabel>
              <FormControl>
                <Input
                  placeholder="Rua, Avenida, etc."
                  {...field}
                  value={field.value ?? ''}
                  className={getFieldClassName(!!cnpjData?.endereco?.logradouro)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Número */}
        <FormField
          control={control}
          name={getFieldName('numero')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input
                  placeholder="123"
                  {...field}
                  value={field.value ?? ''}
                  className={getFieldClassName(!!cnpjData?.endereco?.numero)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Complemento */}
        <FormField
          control={control}
          name={getFieldName('complemento')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Sala, Andar, etc."
                  {...field}
                  value={field.value ?? ''}
                  className={getFieldClassName(!!cnpjData?.endereco?.complemento)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Bairro */}
        <FormField
          control={control}
          name={getFieldName('bairro')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do bairro"
                  {...field}
                  value={field.value ?? ''}
                  className={getFieldClassName(!!cnpjData?.endereco?.bairro)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Cidade */}
        <FormField
          control={control}
          name={getFieldName('cidade')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome da cidade"
                  {...field}
                  value={field.value ?? ''}
                  className={getFieldClassName(!!cnpjData?.endereco?.municipio)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Estado */}
        <FormField
          control={control}
          name={getFieldName('estado')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={getFieldClassName(!!cnpjData?.endereco?.uf)}
                  >
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};