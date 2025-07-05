import { Calculator,ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WizardNavigationProps {
  etapaAtual: number;
  podeVoltar: boolean;
  podeAvancar: boolean;
  isUltimaEtapa: boolean;
  isSubmitindo: boolean;
  isCalculando: boolean;
  calculandoIA: boolean;
  onEtapaAnterior: () => void;
  onProximaEtapa: () => void;
  onSubmit: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  etapaAtual,
  podeVoltar,
  podeAvancar,
  isUltimaEtapa,
  isSubmitindo,
  isCalculando,
  calculandoIA,
  onEtapaAnterior,
  onProximaEtapa,
  onSubmit
}) => {
  const isProcessando = isSubmitindo || isCalculando || calculandoIA;

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          
          {/* Botão Voltar */}
          <Button
            type="button"
            variant="outline"
            onClick={onEtapaAnterior}
            disabled={!podeVoltar || isProcessando}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Etapa Anterior
          </Button>

          {/* Indicador da Etapa */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Etapa {etapaAtual} de 4
            </p>
            {isProcessando && (
              <p className="text-xs text-blue-600 animate-pulse">
                {calculandoIA ? "🤖 Calculando com IA..." : 
                 isCalculando ? "💾 Criando orçamento..." : 
                 "⏳ Processando..."}
              </p>
            )}
          </div>

          {/* Botão Próxima/Finalizar */}
          {isUltimaEtapa ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isProcessando}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Calculator className="h-4 w-4" />
              {isProcessando ? "Finalizando..." : "Finalizar Orçamento"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onProximaEtapa}
              disabled={!podeAvancar || isProcessando}
              className="flex items-center gap-2"
            >
              Próxima Etapa
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
};