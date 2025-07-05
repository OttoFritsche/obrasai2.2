import { Mail, Phone } from 'lucide-react';
import type { Control, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatPhone } from '@/lib/utils/formatters';

// Definindo uma constraint para o tipo genérico T
// Garante que qualquer formulário que use este componente
// tenha os campos 'email' e 'telefone' como strings opcionais.
interface ContactFormValues extends FieldValues {
  email?: string;
  telefone?: string;
}

interface ContatoFieldsProps<T extends ContactFormValues> {
  control: Control<T>;
  isLoading?: boolean;
  fieldPrefix?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
}

/**
 * Componente reutilizável para campos de contato
 * 
 * Responsabilidades:
 * - Renderizar campos de email e telefone padronizados
 * - Aplicar formatação automática (telefone)
 * - Fornecer ícones visuais consistentes
 * - Manter consistência entre formulários PJ e PF
 * 
 * Benefícios:
 * - Elimina duplicação de código
 * - Garante consistência visual
 * - Facilita manutenção dos campos de contato
 * - Permite reutilização em outros formulários
 */
export const ContatoFields = <T extends ContactFormValues>({
  control,
  isLoading = false,
  fieldPrefix = '',
  emailPlaceholder = 'email@dominio.com',
  phonePlaceholder = '(00) 00000-0000'
}: ContatoFieldsProps<T>) => {
  const getFieldName = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Informações de Contato
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <FormField
          control={control}
          name={getFieldName('email')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={emailPlaceholder}
                    {...field}
                    value={field.value ?? ''}
                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Telefone */}
        <FormField
          control={control}
          name={getFieldName('telefone')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={phonePlaceholder}
                    {...field}
                    value={formatPhone(field.value || '')}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      field.onChange(formatted);
                    }}
                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};