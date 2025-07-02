import React from 'react';
import { Calculator, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WizardHeaderProps {
  etapaAtual: number;
  isCalculando: boolean;
  calculandoIA: boolean;
}

const ETAPAS = [
  { numero: 1, titulo: "Informações Básicas", icone: "📋" },
  { numero: 2, titulo: "Localização", icone: "📍" },
  { numero: 3, titulo: "Dimensões", icone: "📐" },
  { numero: 4, titulo: "Padrão & Finalização", icone: "⚙️" }
];

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  etapaAtual,
  isCalculando,
  calculandoIA
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Wizard de Orçamento Paramétrico
            </h1>
          </div>
          
          {(isCalculando || calculandoIA) && (
            <Badge variant="outline" className="animate-pulse">
              {calculandoIA ? "🤖 Calculando com IA..." : "💾 Salvando..."}
            </Badge>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {ETAPAS.map((etapa, index) => (
            <React.Fragment key={etapa.numero}>
              <div className="flex items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${etapa.numero < etapaAtual 
                      ? 'bg-green-500 text-white' 
                      : etapa.numero === etapaAtual
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}
                >
                  {etapa.numero < etapaAtual ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    etapa.icone
                  )}
                </div>
                <div className="ml-3 text-left">
                  <p className={`text-sm font-medium ${
                    etapa.numero === etapaAtual 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500'
                  }`}>
                    Etapa {etapa.numero}
                  </p>
                  <p className={`text-xs ${
                    etapa.numero === etapaAtual 
                      ? 'text-gray-900 dark:text-gray-100 font-medium' 
                      : 'text-gray-400'
                  }`}>
                    {etapa.titulo}
                  </p>
                </div>
              </div>
              
              {index < ETAPAS.length - 1 && (
                <div 
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors
                    ${etapa.numero < etapaAtual 
                      ? 'bg-green-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                    }
                  `} 
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};