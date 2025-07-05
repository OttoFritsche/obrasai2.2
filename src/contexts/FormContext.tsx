import { zodResolver } from '@hookform/resolvers/zod';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { DefaultValues,FieldValues, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface FormContextValue<T extends FieldValues> {
  form: UseFormReturn<T>;
  isLoading: boolean;
  error: Error | null;
  submitForm: (data: T) => Promise<void>;
  resetForm: () => void;
  isDirty: boolean;
  isValid: boolean;
}

const FormContext = createContext<FormContextValue<any> | null>(null);

interface FormProviderProps<T extends FieldValues> {
  children: React.ReactNode;
  schema: z.ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
}

export function FormProvider<T extends FieldValues>({
  children,
  schema,
  defaultValues,
  onSubmit,
  successMessage = 'Dados salvos com sucesso!',
  errorMessage = 'Erro ao salvar dados',
  resetOnSuccess = false
}: FormProviderProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const { execute, isLoading, error } = useAsyncOperation({
    showSuccessToast: true,
    showErrorToast: true,
    successMessage,
    errorMessage
  });

  const submitForm = useCallback(async (data: T) => {
    await execute(async () => {
      await onSubmit(data);
      if (resetOnSuccess) {
        form.reset();
      }
    });
  }, [execute, onSubmit, resetOnSuccess, form]);

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  const value = useMemo(() => ({
    form,
    isLoading,
    error,
    submitForm,
    resetForm,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid
  }), [form, isLoading, error, submitForm, resetForm]);

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<T extends FieldValues>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext deve ser usado dentro de um FormProvider');
  }
  return context;
}

// Hook especializado para formulários com validação automática
export function useValidatedFormContext<T extends FieldValues>() {
  const context = useFormContext<T>();
  
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    return context.form.handleSubmit(context.submitForm)(e);
  }, [context.form, context.submitForm]);

  return {
    ...context,
    handleSubmit
  };
}

// Hook para campos de formulário com formatação automática
export function useFormField<T extends FieldValues>(name: keyof T, formatter?: (value: string) => string) {
  const { form } = useFormContext<T>();
  
  const field = form.register(name as string);
  const value = form.watch(name as string);
  const error = form.formState.errors[name as string];

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatter ? formatter(rawValue) : rawValue;
    form.setValue(name as string, formattedValue, { shouldValidate: true, shouldDirty: true });
  }, [form, name, formatter]);

  return {
    ...field,
    value,
    error,
    onChange
  };
}

// Hook para auto-preenchimento de formulários
export function useAutoFill<T extends FieldValues>() {
  const { form } = useFormContext<T>();
  
  const fillFields = useCallback((data: Partial<T>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.setValue(key as keyof T, value, { shouldValidate: true, shouldDirty: true });
      }
    });
  }, [form]);

  const fillField = useCallback((name: keyof T, value: any) => {
    form.setValue(name as string, value, { shouldValidate: true, shouldDirty: true });
  }, [form]);

  return {
    fillFields,
    fillField
  };
}

// Hook para navegação entre etapas de formulário
export function useFormSteps(totalSteps: number) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const { isValid } = useFormContext();

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1 && isValid) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, isValid]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    canGoNext: isValid && currentStep < totalSteps - 1,
    canGoPrev: currentStep > 0
  };
}