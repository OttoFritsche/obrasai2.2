import { useCallback, useRef,useState } from 'react';

import { useAsyncOperation } from './useAsyncOperation';

export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface FormValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | undefined;
}

export interface FormConfig<T extends Record<string, unknown>> {
  initialValues: T;
  validationRules?: { [K in keyof T]?: FormValidationRule<T[K]> };
  onSubmit: (values: T) => Promise<unknown>;
  resetOnSuccess?: boolean;
}

/**
 * Hook unificado para gerenciar estado de formulários
 * Elimina duplicação de lógica de validação e submissão
 */
export function useFormState<T extends Record<string, unknown>>(config: FormConfig<T>) {
  const { initialValues, validationRules = {}, onSubmit, resetOnSuccess = false } = config;
  const asyncOperation = useAsyncOperation({
    showSuccessToast: true,
    showErrorToast: true
  });
  
  const initialFieldsRef = useRef<FormState<T>['fields']>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key],
        error: undefined,
        touched: false
      };
      return acc;
    }, {} as FormState<T>['fields'])
  );

  const [fields, setFields] = useState<FormState<T>['fields']>(initialFieldsRef.current);

  const validateField = useCallback((name: keyof T, value: T[keyof T]): string | undefined => {
    const rules = validationRules[name];
    if (!rules) return undefined;

    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo é obrigatório';
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Mínimo de ${rules.minLength} caracteres`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Máximo de ${rules.maxLength} caracteres`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Formato inválido';
      }
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return undefined;
  }, [validationRules]);

  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateField(name, value),
        touched: true
      }
    }));
  }, [validateField]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error
      }
    }));
  }, []);

  const validateAllFields = useCallback(() => {
    const newFields = { ...fields };
    let hasErrors = false;

    Object.keys(fields).forEach(key => {
      const fieldKey = key as keyof T;
      const error = validateField(fieldKey, fields[fieldKey].value);
      newFields[fieldKey] = {
        ...newFields[fieldKey],
        error,
        touched: true
      };
      if (error) hasErrors = true;
    });

    setFields(newFields);
    return !hasErrors;
  }, [fields, validateField]);

  const getValues = useCallback((): T => {
    return Object.keys(fields).reduce((acc, key) => {
      acc[key as keyof T] = fields[key as keyof T].value;
      return acc;
    }, {} as T);
  }, [fields]);

  const reset = useCallback(() => {
    setFields(initialFieldsRef.current);
    asyncOperation.reset();
  }, [asyncOperation]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }

    try {
      const values = getValues();
      await asyncOperation.execute(() => onSubmit(values));
      
      if (resetOnSuccess) {
        reset();
      }
    } catch {
      // Error já tratado pelo asyncOperation
    }
  }, [validateAllFields, getValues, asyncOperation, onSubmit, resetOnSuccess, reset]);

  const isValid = Object.values(fields).every(field => !field.error);
  const isDirty = Object.keys(fields).some(key => {
    const fieldKey = key as keyof T;
    return fields[fieldKey].value !== initialValues[fieldKey];
  });

  return {
    fields,
    isValid,
    isDirty,
    isSubmitting: asyncOperation.isLoading,
    error: asyncOperation.error,
    isSuccess: asyncOperation.isSuccess,
    setFieldValue,
    setFieldError,
    getValues,
    reset,
    handleSubmit,
    validateAllFields
  };
}

// Hook especializado para formulários simples
export function useSimpleForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<unknown>
) {
  return useFormState({
    initialValues,
    onSubmit,
    resetOnSuccess: true
  });
}

// Hook especializado para formulários com validação
export function useValidatedForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: { [K in keyof T]?: FormValidationRule<T[K]> },
  onSubmit: (values: T) => Promise<unknown>
) {
  return useFormState({
    initialValues,
    validationRules,
    onSubmit,
    resetOnSuccess: false
  });
}