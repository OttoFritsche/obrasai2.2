import { AlertTriangle, Ruler } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type WizardCompleto } from '@/lib/validations/orcamento';

interface WizardEtapa3Props {
  form: UseFormReturn<WizardCompleto>;
}

export const WizardEtapa3: React.FC<WizardEtapa3Props> = ({ form }) => {
  const areaTotal = form.watch('area_total');
  const areaConstruida = form.watch('area_construida');
  
  // Validação lógica em tempo real
  const areaConstruidaMaiorQueTotal = areaConstruida && areaTotal && 
    parseFloat(areaConstruida.toString()) > parseFloat(areaTotal.toString());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-blue-600" />
          Etapa 3: Dimensões da Obra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Área Total */}
        <FormField
          control={form.control}
          name="area_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área Total da Obra (m²) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="120"
                  min="1"
                  max="9999"
                  step="0.01"
                  value={field.value || ''}
                  onChange={(e) => {
                    const valor = e.target.value;
                    field.onChange(valor === '' ? '' : parseFloat(valor) || '');
                  }}
                />
              </FormControl>
              <FormDescription>
                <strong>Exemplo:</strong> Casa térrea 120m², Sobrado 180m², Apartamento 80m²
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Área Construída */}
        <FormField
          control={form.control}
          name="area_construida"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área Construída (m²) - Opcional</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="100"
                  min="1"
                  max="9999"
                  step="0.01"
                  value={field.value || ''}
                  onChange={(e) => {
                    const valor = e.target.value;
                    field.onChange(valor === '' ? '' : parseFloat(valor) || '');
                  }}
                />
              </FormControl>
              <FormDescription>
                Área que efetivamente receberá acabamentos (normalmente menor que área total)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Alerta se área construída for maior que total */}
        {areaConstruidaMaiorQueTotal && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> A área construída ({areaConstruida}m²) não pode ser maior que a área total ({areaTotal}m²).
              Verifique os valores inseridos.
            </AlertDescription>
          </Alert>
        )}

        {/* Campo simplificado - removendo área detalhada confusa */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Como medir corretamente
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">📏 Área Total:</h5>
              <ul className="text-green-700 dark:text-green-300 space-y-1">
                <li>• Casa térrea: largura × comprimento</li>
                <li>• Sobrado: soma de todos os pavimentos</li>
                <li>• Inclui varandas cobertas</li>
                <li>• Mede pela parte externa das paredes</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">🏠 Área Construída:</h5>
              <ul className="text-green-700 dark:text-green-300 space-y-1">
                <li>• Área interna dos cômodos</li>
                <li>• Exclui varandas abertas</li>
                <li>• Área que recebe acabamento</li>
                <li>• Pode deixar em branco se não souber</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exemplos práticos */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Exemplos de Medição
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <div><strong>Casa popular:</strong> Área total 60m², Área construída 55m²</div>
            <div><strong>Casa padrão:</strong> Área total 120m², Área construída 110m²</div>
            <div><strong>Sobrado:</strong> Área total 180m² (90m² × 2 pisos), Área construída 160m²</div>
            <div><strong>Apartamento:</strong> Área total 80m², Área construída 75m²</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};