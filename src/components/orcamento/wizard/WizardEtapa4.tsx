import { Settings, Sparkles } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

        {/* Especificações */}
        <FormField
          control={form.control}
          name="especificacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especificações Técnicas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Exemplo: Piso em porcelanato 60x60cm, paredes em textura acrílica, forro em gesso com sanca, esquadrias em alumínio branco, portões automáticos, piscina 6x3m com deck"
                  className="min-h-[100px]"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Descreva materiais, acabamentos e detalhes técnicos específicos da obra
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parâmetros de Entrada */}
        <FormField
          control={form.control}
          name="parametros_entrada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informações Extras</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Exemplo: Obra em condomínio fechado, terreno com declive 15%, necessário muro de arrimo, instalação de ar condicionado split em todos os quartos, sistema de energia solar"
                  className="min-h-[100px]"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Detalhes sobre localização, condições do terreno e instalações especiais
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