import React from 'react'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VariacaoSinapiIndicatorProps {
  valorReal: number
  valorSinapi: number
  className?: string
}

export const VariacaoSinapiIndicator: React.FC<VariacaoSinapiIndicatorProps> = ({
  valorReal,
  valorSinapi,
  className = ''
}) => {
  if (!valorReal || !valorSinapi) return null
  
  const variacao = ((valorReal - valorSinapi) / valorSinapi) * 100
  const valorAbsoluto = Math.abs(variacao)
  
  const getConfig = () => {
    if (valorAbsoluto <= 5) {
      return {
        icon: <Info className="w-4 h-4" />,
        variant: 'default' as const,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        message: 'Dentro da faixa normal de variação'
      }
    }
    
    if (variacao > 5) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        variant: 'destructive' as const,
        color: 'text-red-700',
        bg: 'bg-red-50',
        message: 'Acima da referência SINAPI - revisar fornecedor'
      }
    }
    
    return {
      icon: <CheckCircle className="w-4 h-4" />,
      variant: 'default' as const,
      color: 'text-green-700',
      bg: 'bg-green-50',
      message: 'Abaixo da referência SINAPI - bom negócio'
    }
  }
  
  const config = getConfig()
  
  return (
    <Alert className={`${config.bg} border-l-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={config.color}>
          {config.icon}
        </div>
        <AlertDescription className={config.color}>
          <div className="flex items-center justify-between">
            <span>{config.message}</span>
            <span className="font-semibold">
              {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs mt-1 opacity-75">
            Valor pago: R$ {valorReal.toFixed(2)} | Referência SINAPI: R$ {valorSinapi.toFixed(2)}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}