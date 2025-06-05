/**
 * 🏷️ Indicador de Manutenção SINAPI
 * 
 * Componente visual para identificar códigos SINAPI de manutenção
 * e seu status atual (ativo, desativado, alterado).
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Wrench,
  Clock,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface ManutencaoIndicatorProps {
  /**
   * Status do código SINAPI
   */
  status: 'ativo' | 'desativado' | 'alterado';
  
  /**
   * Tipo de manutenção
   */
  tipoManutencao?: string;
  
  /**
   * Se tem alterações recentes (últimos 90 dias)
   */
  alteracoesRecentes?: boolean;
  
  /**
   * Data da última alteração
   */
  ultimaAlteracao?: string;
  
  /**
   * Tamanho do componente
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Se deve mostrar texto detalhado
   */
  showDetails?: boolean;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
}

// ====================================
// 🎨 CONFIGURAÇÕES DE ESTILO
// ====================================

const STATUS_CONFIG = {
  ativo: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700',
    icon: CheckCircle,
    label: 'Ativo'
  },
  desativado: {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700',
    icon: XCircle,
    label: 'Desativado'
  },
  alterado: {
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
    icon: RefreshCw,
    label: 'Alterado'
  }
} as const;

const SIZE_CONFIG = {
  sm: {
    badge: 'text-xs px-2 py-1',
    icon: 'h-3 w-3',
    text: 'text-xs'
  },
  md: {
    badge: 'text-sm px-2.5 py-1',
    icon: 'h-4 w-4',
    text: 'text-sm'
  },
  lg: {
    badge: 'text-base px-3 py-1.5',
    icon: 'h-5 w-5',
    text: 'text-base'
  }
} as const;

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

export const ManutencaoIndicator: React.FC<ManutencaoIndicatorProps> = ({
  status,
  tipoManutencao,
  alteracoesRecentes = false,
  ultimaAlteracao,
  size = 'md',
  showDetails = false,
  className
}) => {
  const statusConfig = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const IconComponent = statusConfig.icon;

  // Formatação da data
  const dataFormatada = ultimaAlteracao 
    ? new Date(ultimaAlteracao).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Badge principal de status */}
      <Badge 
        variant="outline"
        className={cn(
          statusConfig.color,
          sizeConfig.badge,
          "flex items-center gap-1.5 font-medium"
        )}
      >
        <IconComponent className={sizeConfig.icon} />
        <span>{statusConfig.label}</span>
      </Badge>

      {/* Indicador de manutenção */}
      <Badge 
        variant="outline"
        className={cn(
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700",
          sizeConfig.badge,
          "flex items-center gap-1"
        )}
      >
        <Wrench className={sizeConfig.icon} />
        <span>SINAPI</span>
      </Badge>

      {/* Indicador de alterações recentes */}
      {alteracoesRecentes && (
        <Badge 
          variant="outline"
          className={cn(
            "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700",
            sizeConfig.badge,
            "flex items-center gap-1"
          )}
        >
          <Clock className={sizeConfig.icon} />
          <span>Recente</span>
        </Badge>
      )}

      {/* Detalhes expandidos */}
      {showDetails && (
        <div className={cn("flex flex-col gap-1", sizeConfig.text)}>
          {tipoManutencao && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Info className={cn(sizeConfig.icon, "opacity-60")} />
              <span className="text-xs">{tipoManutencao}</span>
            </div>
          )}
          
          {dataFormatada && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className={cn(sizeConfig.icon, "opacity-60")} />
              <span className="text-xs">Última alteração: {dataFormatada}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ====================================
// 🔄 VARIANTES ESPECÍFICAS
// ====================================

/**
 * Variante compacta para uso em tabelas
 */
export const ManutencaoIndicatorCompact: React.FC<
  Pick<ManutencaoIndicatorProps, 'status' | 'alteracoesRecentes'>
> = ({ status, alteracoesRecentes }) => {
  const statusConfig = STATUS_CONFIG[status];
  const IconComponent = statusConfig.icon;

  return (
    <div className="flex items-center gap-1">
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          status === 'ativo' && "bg-emerald-500",
          status === 'desativado' && "bg-red-500",
          status === 'alterado' && "bg-amber-500"
        )}
        title={`Status: ${statusConfig.label}`}
      />
      
      <IconComponent className="h-3 w-3 text-muted-foreground" />
      
      {alteracoesRecentes && (
        <div 
          className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"
          title="Alterações recentes"
        />
      )}
    </div>
  );
};

/**
 * Variante com tooltip detalhado
 */
export const ManutencaoIndicatorWithTooltip: React.FC<ManutencaoIndicatorProps> = (props) => {
  const tooltipContent = [
    `Status: ${STATUS_CONFIG[props.status].label}`,
    props.tipoManutencao && `Tipo: ${props.tipoManutencao}`,
    props.ultimaAlteracao && `Última alteração: ${new Date(props.ultimaAlteracao).toLocaleDateString('pt-BR')}`,
    props.alteracoesRecentes && "⚠️ Teve alterações nos últimos 90 dias"
  ].filter(Boolean).join('\n');

  return (
    <div title={tooltipContent}>
      <ManutencaoIndicator {...props} />
    </div>
  );
};

// ====================================
// 📤 EXPORTS
// ====================================

export default ManutencaoIndicator; 