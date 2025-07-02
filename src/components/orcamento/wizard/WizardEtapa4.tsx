import React from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { PADRAO_OBRA_LABELS, type WizardCompleto } from '@/lib/validations/orcamento';

interface WizardEtapa4Props {
  form: UseFormReturn<WizardCompleto>;
}

export const WizardEtapa4: React.FC<WizardEtapa4Props> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Etapa 4: Padrão da Obra e Finalizações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Padrão da Obra */}
        <FormField
          control={form.control}
          name="padrao_obra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Padrão da Obra *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o padrão de acabamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PADRAO_OBRA_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                O padrão define a qualidade dos materiais e acabamentos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Opções Adicionais */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Incluir no Orçamento:
          </h4>

          <FormField
            control={form.control}
            name="incluir_terreno"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Custo do Terreno
                  </FormLabel>
                  <FormDescription>
                    Incluir estimativa do valor do terreno baseado na região
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incluir_projeto"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Projeto Arquitetônico
                  </FormLabel>
                  <FormDescription>
                    Incluir custos de projeto arquitetônico e complementares
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incluir_fundacao"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Fundação Completa
                  </FormLabel>
                  <FormDescription>
                    Incluir todos os serviços de fundação e estrutura
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Adicionais</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione qualquer informação específica que possa influenciar o orçamento..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Informações adicionais para personalizar o cálculo do orçamento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Informações sobre IA */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">
              Cálculo Inteligente com IA
            </h4>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Após criar o orçamento, nossa IA irá analisar todos os dados fornecidos 
            e gerar uma estimativa de custo mais precisa baseada em dados reais do mercado.
          </p>
        </div>

      </CardContent>
    </Card>
  );
};