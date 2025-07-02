import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { ESTADOS_BRASILEIROS, type WizardCompleto } from '@/lib/validations/orcamento';
import { useCEP } from '@/hooks/useCEP';

interface WizardEtapa2Props {
  form: UseFormReturn<WizardCompleto>;
  cepData: ReturnType<typeof useCEP>;
}

export const WizardEtapa2: React.FC<WizardEtapa2Props> = ({ form, cepData }) => {
  const handleBuscarCEP = async () => {
    const cep = form.getValues('cep');
    if (cep && cep.length >= 8) {
      const resultado = await cepData.buscarCEP(cep);
      if (resultado) {
        form.setValue('cidade', resultado.cidade);
        form.setValue('estado', resultado.estado);
        form.setValue('endereco', resultado.endereco);
      }
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
                    {...field} 
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBuscarCEP}
                  disabled={cepData.isLoading}
                  size="icon"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <FormDescription>
                O CEP influencia nos custos de materiais e mão de obra
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
                    <SelectItem key={estado} value={estado}>
                      {estado}
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

        {/* Endereço */}
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço Completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Rua, número, bairro..." 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Endereço detalhado da obra (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
};