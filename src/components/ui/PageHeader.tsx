import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Componente reutilizável para headers de páginas
 * Elimina duplicação de estrutura de headers em todo o projeto
 */

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function PageHeader({
  title,
  description,
  icon,
  backTo,
  backLabel = 'Voltar',
  actions,
  className,
  animated = true,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const content = (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        {backTo && (
          <motion.div
            initial={animated ? { opacity: 0, x: -20 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={animated ? { delay: 0.1 } : false}
          >
            <Button
              variant="outline"
              onClick={handleBack}
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              {backLabel}
            </Button>
          </motion.div>
        )}
        
        <motion.div
          initial={animated ? { opacity: 0, x: -20 } : false}
          animate={animated ? { opacity: 1, x: 0 } : false}
          transition={animated ? { delay: backTo ? 0.2 : 0.1 } : false}
          className="flex items-center gap-3"
        >
          {icon && (
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </motion.div>
      </div>

      {actions && (
        <motion.div
          initial={animated ? { opacity: 0, x: 20 } : false}
          animate={animated ? { opacity: 1, x: 0 } : false}
          transition={animated ? { delay: 0.3 } : false}
        >
          {actions}
        </motion.div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

/**
 * Variação simplificada do PageHeader para casos mais simples
 */
export function SimplePageHeader({
  title,
  description,
  className,
}: Pick<PageHeaderProps, 'title' | 'description' | 'className'>) {
  return (
    <div className={cn('space-y-1', className)}>
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}