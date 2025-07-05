import { Building } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TIPO_OBRA_LABELS, type WizardCompleto } from '@/lib/validations/orcamento';

interface WizardEtapa1Props {
  form: UseFormReturn<WizardCompleto>;
}

export const WizardEtapa1: React.FC<WizardEtapa1Props> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          Etapa 1: Informações Básicas da Obra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Nome da Obra */}
        <FormField
          control={form.control}
          name="nome_orcamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Orçamento *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Orçamento Casa da Família Silva" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Defina um nome identificador para este orçamento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Obra */}
        <FormField
          control={form.control}
          name="tipo_obra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Obra *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de obra" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(TIPO_OBRA_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                O tipo influencia nos cálculos e materiais necessários
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Obra</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva brevemente o projeto e suas características principais..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Adicione detalhes que possam ajudar no cálculo do orçamento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
};