import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Componente reutilizável para cards com gradientes
 * Elimina duplicação de estilos de cards em todo o projeto
 */

export type GradientCardVariant = 
  | 'default'
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'yellow'
  | 'indigo'
  | 'green'
  | 'slate';

interface GradientCardProps {
  variant?: GradientCardVariant;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<GradientCardVariant, string> = {
  default: 'border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm',
  blue: 'border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm',
  emerald: 'border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50/95 to-emerald-100/95 dark:from-emerald-900/20 dark:to-emerald-800/20 backdrop-blur-sm',
  purple: 'border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10 backdrop-blur-sm',
  yellow: 'border-yellow-200/50 dark:border-yellow-700/50 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10 backdrop-blur-sm',
  indigo: 'border-indigo-200/50 dark:border-indigo-700/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 backdrop-blur-sm',
  green: 'border-green-200/50 dark:border-green-700/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 backdrop-blur-sm',
  slate: 'border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/95 to-slate-100/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm',
};

export function GradientCard({ 
  variant = 'default', 
  className, 
  children, 
  title, 
  description, 
  icon 
}: GradientCardProps) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      {(title || description || icon) && (
        <CardHeader>
          {title && (
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Card específico para informações (com ícone de info)
 */
export function InfoCard({ className, children, ...props }: Omit<GradientCardProps, 'variant'>) {
  return (
    <GradientCard 
      variant="blue" 
      className={cn('border-info/50 bg-info/10', className)}
      {...props}
    >
      {children}
    </GradientCard>
  );
}

/**
 * Card específico para sucesso (com ícone de check)
 */
export function SuccessCard({ className, children, ...props }: Omit<GradientCardProps, 'variant'>) {
  return (
    <GradientCard 
      variant="emerald" 
      className={className}
      {...props}
    >
      {children}
    </GradientCard>
  );
}

/**
 * Card específico para avisos (com ícone de warning)
 */
export function WarningCard({ className, children, ...props }: Omit<GradientCardProps, 'variant'>) {
  return (
    <GradientCard 
      variant="yellow" 
      className={className}
      {...props}
    >
      {children}
    </GradientCard>
  );
}