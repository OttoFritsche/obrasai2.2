import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { GradientCard } from './GradientCard';

/**
 * Componente wrapper reutilizável para formulários
 * Elimina duplicação de estrutura de formulários em todo o projeto
 */

interface FormWrapperProps<T = Record<string, unknown>> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  title?: string;
  description?: string;
  children: React.ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
  animated?: boolean;
  cardVariant?: 'default' | 'blue' | 'emerald' | 'purple' | 'yellow' | 'indigo' | 'green' | 'slate';
  actions?: React.ReactNode;
}

export function FormWrapper<T = Record<string, unknown>>({
  form,
  onSubmit,
  title,
  description,
  children,
  submitLabel = 'Salvar',
  isLoading = false,
  className,
  animated = true,
  cardVariant = 'default',
  actions,
}: FormWrapperProps<T>) {
  const content = (
    <GradientCard 
      variant={cardVariant}
      title={title}
      description={description}
      className={className}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {children}
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex-1">
              {actions}
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </Form>
    </GradientCard>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

/**
 * Wrapper específico para formulários de criação
 */
export function CreateFormWrapper<T = Record<string, unknown>>(props: Omit<FormWrapperProps<T>, 'submitLabel'>) {
  return (
    <FormWrapper<T>
      {...props} 
      submitLabel="Criar"
      cardVariant="blue"
    />
  );
}

/**
 * Wrapper específico para formulários de edição
 */
export function EditFormWrapper<T = Record<string, unknown>>(props: Omit<FormWrapperProps<T>, 'submitLabel'>) {
  return (
    <FormWrapper<T>
      {...props} 
      submitLabel="Atualizar"
      cardVariant="emerald"
    />
  );
}

/**
 * Seção de formulário reutilizável
 */
interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  icon, 
  children, 
  className 
}: FormSectionProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}