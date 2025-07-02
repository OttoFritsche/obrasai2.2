import React from 'react';
import { Ruler } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { type WizardCompleto } from '@/lib/validations/orcamento';

interface WizardEtapa3Props {
  form: UseFormReturn<WizardCompleto>;
}

export const WizardEtapa3: React.FC<WizardEtapa3Props> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-blue-600" />
          Etapa 3: Dimensões e Características
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Área Total */}
        <FormField
          control={form.control}
          name="area_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área Total (m²) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="120"
                  min="1"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Área total construída em metros quadrados
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quartos */}
          <FormField
            control={form.control}
            name="quartos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartos *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="3"
                    min="1"
                    max="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Número de quartos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Banheiros */}
          <FormField
            control={form.control}
            name="banheiros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banheiros *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2"
                    min="1"
                    max="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Número de banheiros
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pavimentos */}
          <FormField
            control={form.control}
            name="pavimentos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pavimentos *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1"
                    min="1"
                    max="5"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Número de andares
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Informações Adicionais */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Dicas para Medição
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• A área total deve incluir todos os ambientes cobertos</li>
            <li>• Não inclua áreas externas como varandas abertas</li>
            <li>• Para casas térreas, considere apenas o pavimento principal</li>
            <li>• Para sobrados, some as áreas de todos os pavimentos</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
};