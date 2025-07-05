import { motion } from 'framer-motion';
import { Building2, CheckCircle, Search,XCircle } from 'lucide-react';
import type { Control } from 'react-hook-form';

import type { CNPJApiResponse } from '@/types/api';
import type { FornecedorPJFormData } from '@/types/forms';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatCNPJ, formatInscricaoEstadual } from '@/lib/utils/formatters';

import { ContatoFields } from './shared/ContatoFields';
import { EnderecoFields } from './shared/EnderecoFields';
import { ResponsavelFields } from './shared/ResponsavelFields';

interface ConstrutoraFormPJProps {
  control: Control<FornecedorPJFormData>;
  isLoading: boolean;
  cnpjData: CNPJApiResponse | null;
  isCNPJLoading: boolean;
  onManualCNPJSearch: () => void;
}

/**
 * Componente para formulário de Pessoa Jurídica
 * 
 * Responsabilidades:
 * - Renderizar campos específicos de PJ (CNPJ, razão social, etc.)
 * - Integrar com lookup de CNPJ
 * - Mostrar status da empresa (ativa/inativa)
 * - Organizar campos em seções lógicas
 * 
 * Benefícios:
 * - Foco específico em dados de PJ
 * - Reutilização de componentes compartilhados
 * - Interface clara e organizada
 * - Feedback visual adequado
 */
export const ConstrutoraFormPJ = ({
  control,
  isLoading,
  cnpjData,
  isCNPJLoading,
  onManualCNPJSearch
}: ConstrutoraFormPJProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Dados Principais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Dados Principais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CNPJ */}
          <FormField
            control={control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="00.000.000/0000-00"
                      {...field}
                      value={formatCNPJ(field.value || '')}
                      onChange={(e) => {
                        const formatted = formatCNPJ(e.target.value);
                        field.onChange(formatted);
                      }}
                      className="pr-10 bg-background/50 focus:bg-background transition-colors"
                      disabled={isLoading}
                    />
                    {isCNPJLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                
                {/* Status da Empresa */}
                {cnpjData && (
                  <div className="flex items-center gap-2 mt-2">
                    {cnpjData.situacao_ativa ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Empresa Ativa
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Empresa Inativa
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Busca Manual */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onManualCNPJSearch}
                  disabled={isLoading || isCNPJLoading}
                  className="mt-2 w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar CNPJ Manualmente
                </Button>
              </FormItem>
            )}
          />
          
          {/* Razão Social */}
          <FormField
            control={control}
            name="nome_razao_social"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão Social</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Razão social da empresa"
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
          
          {/* Nome Fantasia */}
          <FormField
            control={control}
            name="nome_fantasia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Fantasia</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome fantasia (opcional)"
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
          
          {/* Inscrição Estadual */}
          <FormField
            control={control}
            name="inscricao_estadual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inscrição Estadual</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000.000"
                    {...field}
                    value={formatInscricaoEstadual(field.value || '')}
                    onChange={(e) => {
                      const formatted = formatInscricaoEstadual(e.target.value);
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
        emailPlaceholder="contato@empresa.com"
        phonePlaceholder="(00) 0000-0000"
      />
      
      {/* Campos de Endereço */}
      <EnderecoFields 
        control={control} 
        isLoading={isLoading}
        cnpjData={cnpjData}
      />
      
      {/* Responsável Técnico */}
      <ResponsavelFields 
        control={control} 
        isLoading={isLoading}
      />
    </motion.div>
  );
};