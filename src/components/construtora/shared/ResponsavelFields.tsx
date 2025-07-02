import type { Control } from 'react-hook-form';
import { User } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ResponsavelFieldsProps {
  // Control genérico para funcionar com PJ e PF
  control: Control<any>;
  // Estados opcionais para feedback visual
  isLoading?: boolean;
  // Prefixo para os nomes dos campos (para flexibilidade futura)
  fieldPrefix?: string;
}

/**
 * Componente reutilizável para campos do responsável técnico
 * 
 * Responsabilidades:
 * - Renderizar campos do responsável técnico padronizados
 * - Manter consistência entre formulários PJ e PF
 * - Fornecer interface clara para dados opcionais
 * 
 * Benefícios:
 * - Elimina duplicação de código
 * - Garante consistência visual
 * - Facilita manutenção dos campos de responsável
 * - Permite reutilização em outros formulários
 */
export const ResponsavelFields = ({ 
  control, 
  isLoading = false, 
  fieldPrefix = '' 
}: ResponsavelFieldsProps) => {
  const getFieldName = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <User className="h-4 w-4" />
        Responsável Técnico (opcional)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome do Responsável Técnico */}
        <FormField
          control={control}
          name={getFieldName('responsavel_tecnico')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Responsável Técnico</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome completo"
                  {...field}
                  value={field.value ?? ''}
                  className="bg-background/50 focus:bg-background transition-colors"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Documento do Responsável */}
        <FormField
          control={control}
          name={getFieldName('documento_responsavel')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento do Responsável</FormLabel>
              <FormControl>
                <Input
                  placeholder="CPF ou CREA/CAU"
                  {...field}
                  value={field.value ?? ''}
                  className="bg-background/50 focus:bg-background transition-colors"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};