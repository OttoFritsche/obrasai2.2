import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VariacaoSinapiIndicatorProps {
  valorReal: number;
  valorSinapi: number;
  className?: string;
  showDetails?: boolean;
}

export const VariacaoSinapiIndicator: React.FC<VariacaoSinapiIndicatorProps> = ({
  valorReal,
  valorSinapi,
  className,
  showDetails = true
}) => {
  // Calcular variação percentual
  const calcularVariacao = () => {
    if (!valorSinapi || valorSinapi === 0) return 0;
    const variacao = ((valorReal - valorSinapi) / valorSinapi) * 100;
    return Number(variacao.toFixed(2));
  };

  const variacao = calcularVariacao();
  const valorAbsoluto = Math.abs(variacao);

  // Determinar cor e ícone baseado na variação
  const getVariacaoStyle = () => {
    if (variacao > 20) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: TrendingUp,
        label: 'Muito acima',
        severity: 'high'
      };
    } else if (variacao > 10) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: TrendingUp,
        label: 'Acima',
        severity: 'medium'
      };
    } else if (variacao < -20) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: TrendingDown,
        label: 'Muito abaixo',
        severity: 'high'
      };
    } else if (variacao < -10) {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: TrendingDown,
        label: 'Abaixo',
        severity: 'medium'
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: Minus,
        label: 'Dentro da faixa',
        severity: 'low'
      };
    }
  };

  const style = getVariacaoStyle();
  const Icon = style.icon;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getVariacaoText = () => {
    if (variacao === 0) return 'Igual ao SINAPI';
    const sinal = variacao > 0 ? '+' : '';
    return `${sinal}${variacao.toFixed(1)}%`;
  };

  const getSeverityBadge = () => {
    switch (style.severity) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Atenção
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
            Moderado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
            Normal
          </Badge>
        );
    }
  };

  if (!valorSinapi || valorSinapi === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <AlertTriangle className="h-4 w-4" />
        Valor SINAPI não disponível
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Indicador principal */}
      <div className={cn(
        'flex items-center gap-2 p-3 rounded-lg border',
        style.bgColor
      )}>
        <Icon className={cn('h-4 w-4', style.color)} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('font-medium text-sm', style.color)}>
              {getVariacaoText()}
            </span>
            {getSeverityBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {style.label} do valor de referência SINAPI
          </p>
        </div>
      </div>

      {/* Detalhes (opcional) */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/30 p-2 rounded">
            <p className="text-muted-foreground">Valor Real</p>
            <p className="font-medium">{formatarMoeda(valorReal)}</p>
          </div>
          <div className="bg-muted/30 p-2 rounded">
            <p className="text-muted-foreground">Ref. SINAPI</p>
            <p className="font-medium">{formatarMoeda(valorSinapi)}</p>
          </div>
        </div>
      )}

      {/* Dicas baseadas na variação */}
      {style.severity === 'high' && (
        <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs">
          <p className="text-amber-800">
            <strong>Dica:</strong> {variacao > 0 
              ? 'Valor muito acima do mercado. Considere renegociar ou buscar outros fornecedores.'
              : 'Valor muito abaixo do mercado. Verifique a qualidade do material/serviço.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VariacaoSinapiIndicator;