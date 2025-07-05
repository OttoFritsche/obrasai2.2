import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import type { Control } from 'react-hook-form';

import { FornecedorPFFormData } from '@/types/forms';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatCPF } from '@/lib/utils/formatters';

import { ContatoFields } from './shared/ContatoFields';
import { EnderecoFields } from './shared/EnderecoFields';
import { ResponsavelFields } from './shared/ResponsavelFields';

interface ConstrutoraFormPFProps {
  control: Control<FornecedorPFFormData>;
  isLoading: boolean;
}

/**
 * Componente para formulário de Pessoa Física
 * 
 * Responsabilidades:
 * - Renderizar campos específicos de PF (CPF, nome completo)
 * - Organizar campos em seções lógicas
 * - Reutilizar componentes compartilhados
 * 
 * Benefícios:
 * - Foco específico em dados de PF
 * - Reutilização de componentes compartilhados
 * - Interface clara e organizada
 * - Consistência com formulário PJ
 */
export const ConstrutoraFormPF = ({
  control,
  isLoading
}: ConstrutoraFormPFProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Dados Pessoais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome Completo */}
          <FormField
            control={control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
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
          
          {/* CPF */}
          <FormField
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    {...field}
                    value={formatCPF(field.value || '')}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      field.onChange(formatted);
                    }}
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
      
      {/* Campos de Contato */}
      <ContatoFields 
        control={control} 
        isLoading={isLoading}
        emailPlaceholder="seuemail@dominio.com"
        phonePlaceholder="(00) 00000-0000"
      />
      
      {/* Campos de Endereço */}
      <EnderecoFields 
        control={control} 
        isLoading={isLoading}
      />
      
      {/* Responsável Técnico */}
      <ResponsavelFields 
        control={control} 
        isLoading={isLoading}
      />
    </motion.div>
  );
};