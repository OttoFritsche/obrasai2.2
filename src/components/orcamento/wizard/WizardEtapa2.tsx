import { MapPin, Search } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { useCEP } from '@/hooks/useCEP';
import { ESTADOS_BRASILEIROS, type WizardCompleto } from '@/lib/validations/orcamento';

interface WizardEtapa2Props {
  form: UseFormReturn<WizardCompleto>;
  cepData: ReturnType<typeof useCEP>;
}

export const WizardEtapa2: React.FC<WizardEtapa2Props> = ({ form, cepData }) => {
  const handleBuscarCEP = async (cepValue?: string) => {
    const cep = cepValue || form.getValues('cep');
    if (cep && cep.replace(/\D/g, '').length === 8) {
      try {
        const resultado = await cepData.buscarCEP(cep);
        if (resultado) {
          form.setValue('cidade', resultado.localidade);
          form.setValue('estado', resultado.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleCepChange = (value: string) => {
    form.setValue('cep', value);
    // Busca automática quando CEP tem 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      handleBuscarCEP(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Etapa 2: Localização da Obra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* CEP */}
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="00000-000" 
                    maxLength={9}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleCepChange(value);
                    }}
                    disabled={cepData.isLoading}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleBuscarCEP()}
                  disabled={cepData.isLoading}
                  size="icon"
                  title="Buscar CEP"
                >
                  {cepData.isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormDescription>
                {cepData.isLoading ? 'Buscando CEP...' : 'O CEP influencia nos custos de materiais e mão de obra'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ESTADOS_BRASILEIROS.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.nome} ({estado.sigla})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Estado onde a obra será realizada
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cidade */}
        <FormField
          control={form.control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome da cidade" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Cidade onde a obra será executada
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />



      </CardContent>
    </Card>
  );
};