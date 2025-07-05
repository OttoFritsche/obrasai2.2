import type { ReactNode} from 'react';
import { createContext, useCallback, useContext, useEffect,useRef, useState } from 'react';

// Tipos para estados de loading mais específicos
interface LoadingEntry {
  isLoading: boolean;
  priority: LoadingPriority;
  group?: string;
  startTime?: number;
  metadata?: Record<string, any>;
}

interface LoadingState {
  [key: string]: LoadingEntry;
}

enum LoadingPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

interface LoadingMetrics {
  totalOperations: number;
  averageDuration: number;
  longestOperation: { key: string; duration: number } | null;
  activeOperations: number;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean, options?: LoadingOptions) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: (group?: string) => boolean;
  getLoadingKeys: (group?: string) => string[];
  clearLoading: (key: string) => void;
  clearAllLoading: (group?: string) => void;
  getHighestPriority: () => LoadingPriority | null;
  getLoadingMetrics: () => LoadingMetrics;
  hasLoadingWithPriority: (priority: LoadingPriority) => boolean;
}

interface LoadingOptions {
  priority?: LoadingPriority;
  group?: string;
  metadata?: Record<string, any>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const metricsRef = useRef<{ [key: string]: number }>({});

  // Definir estado de loading para uma chave específica com opções avançadas
  const setLoading = useCallback((key: string, loading: boolean, options: LoadingOptions = {}) => {
    const { priority = LoadingPriority.NORMAL, group, metadata } = options;
    
    setLoadingStates(prev => {
      if (loading) {
        // Iniciar loading
        const startTime = Date.now();
        return {
          ...prev,
          [key]: {
            isLoading: true,
            priority,
            group,
            startTime,
            metadata
          }
        };
      } else {
        // Finalizar loading e calcular métricas
        const entry = prev[key];
        if (entry?.startTime) {
          const duration = Date.now() - entry.startTime;
          metricsRef.current[key] = duration;
        }
        
        const { [key]: _, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  // Verificar se uma chave específica está loading
  const isLoading = useCallback((key: string): boolean => {
    return Boolean(loadingStates[key]?.isLoading);
  }, [loadingStates]);

  // Verificar se qualquer operação está loading (opcionalmente por grupo)
  const isAnyLoading = useCallback((group?: string): boolean => {
    return Object.values(loadingStates).some(entry => {
      if (!entry.isLoading) return false;
      if (group && entry.group !== group) return false;
      return true;
    });
  }, [loadingStates]);

  // Obter todas as chaves que estão loading (opcionalmente por grupo)
  const getLoadingKeys = useCallback((group?: string): string[] => {
    return Object.keys(loadingStates).filter(key => {
      const entry = loadingStates[key];
      if (!entry?.isLoading) return false;
      if (group && entry.group !== group) return false;
      return true;
    });
  }, [loadingStates]);

  // Limpar loading específico
  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Limpar todos os loadings (opcionalmente por grupo)
  const clearAllLoading = useCallback((group?: string) => {
    if (!group) {
      setLoadingStates({});
      return;
    }
    
    setLoadingStates(prev => {
      const filtered = Object.entries(prev).reduce((acc, [key, entry]) => {
        if (entry.group !== group) {
          acc[key] = entry;
        }
        return acc;
      }, {} as LoadingState);
      return filtered;
    });
  }, []);

  // Obter a prioridade mais alta entre operações ativas
  const getHighestPriority = useCallback((): LoadingPriority | null => {
    const priorities = Object.values(loadingStates)
      .filter(entry => entry.isLoading)
      .map(entry => entry.priority);
    
    return priorities.length > 0 ? Math.max(...priorities) as LoadingPriority : null;
  }, [loadingStates]);

  // Obter métricas de performance
  const getLoadingMetrics = useCallback((): LoadingMetrics => {
    const durations = Object.values(metricsRef.current);
    const activeOperations = Object.values(loadingStates).filter(entry => entry.isLoading).length;
    
    const totalOperations = durations.length;
    const averageDuration = totalOperations > 0 ? durations.reduce((a, b) => a + b, 0) / totalOperations : 0;
    
    const longestDuration = Math.max(...durations, 0);
    const longestKey = Object.entries(metricsRef.current).find(([_, duration]) => duration === longestDuration)?.[0];
    
    return {
      totalOperations,
      averageDuration,
      longestOperation: longestKey ? { key: longestKey, duration: longestDuration } : null,
      activeOperations
    };
  }, [loadingStates]);

  // Verificar se há loading com prioridade específica
  const hasLoadingWithPriority = useCallback((priority: LoadingPriority): boolean => {
    return Object.values(loadingStates).some(entry => 
      entry.isLoading && entry.priority === priority
    );
  }, [loadingStates]);

  const value: LoadingContextType = {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingKeys,
    clearLoading,
    clearAllLoading,
    getHighestPriority,
    getLoadingMetrics,
    hasLoadingWithPriority,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  return context;
};

// Hook para operações assíncronas com loading automático e opções avançadas
export const useLoadingOperation = () => {
  const { setLoading } = useLoading();

  const executeWithLoading = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      loadingKey: string,
      options?: LoadingOptions
    ): Promise<T> => {
      try {
        setLoading(loadingKey, true, options);
        const result = await operation();
        return result;
      } finally {
        setLoading(loadingKey, false);
      }
    },
    [setLoading]
  );

  // Executar múltiplas operações com diferentes prioridades
  const executeMultipleWithLoading = useCallback(
    async <T,>(
      operations: Array<{
        operation: () => Promise<T>;
        key: string;
        options?: LoadingOptions;
      }>
    ): Promise<T[]> => {
      const promises = operations.map(({ operation, key, options }) =>
        executeWithLoading(operation, key, options)
      );
      return Promise.all(promises);
    },
    [executeWithLoading]
  );

  return { executeWithLoading, executeMultipleWithLoading };
};

// Hook para estados de loading comuns da aplicação com grupos e prioridades
export const useAppLoadingStates = () => {
  const { setLoading, isLoading, clearLoading, isAnyLoading, clearAllLoading } = useLoading();

  return {
    // Estados de inicialização (prioridade crítica)
    setInitializing: (loading: boolean) => 
      setLoading('app:initializing', loading, { 
        priority: LoadingPriority.CRITICAL, 
        group: 'app' 
      }),
    isInitializing: () => isLoading('app:initializing'),
    
    // Estados de navegação (prioridade alta)
    setNavigating: (loading: boolean) => 
      setLoading('app:navigating', loading, { 
        priority: LoadingPriority.HIGH, 
        group: 'navigation' 
      }),
    isNavigating: () => isLoading('app:navigating'),
    
    // Estados de formulários (prioridade normal)
    setFormSubmitting: (formId: string, loading: boolean) => 
      setLoading(`form:${formId}:submitting`, loading, { 
        priority: LoadingPriority.NORMAL, 
        group: 'forms',
        metadata: { formId }
      }),
    isFormSubmitting: (formId: string) => isLoading(`form:${formId}:submitting`),
    isAnyFormSubmitting: () => isAnyLoading('forms'),
    
    // Estados de IA (prioridade alta)
    setAIProcessing: (loading: boolean, metadata?: Record<string, any>) => 
      setLoading('ai:processing', loading, { 
        priority: LoadingPriority.HIGH, 
        group: 'ai',
        metadata 
      }),
    isAIProcessing: () => isLoading('ai:processing'),
    
    // Verificações por grupo
    isAnyAppLoading: () => isAnyLoading('app'),
    isAnyNavigationLoading: () => isAnyLoading('navigation'),
    isAnyAILoading: () => isAnyLoading('ai'),
    
    // Limpar estados específicos
    clearInitializing: () => clearLoading('app:initializing'),
    clearNavigating: () => clearLoading('app:navigating'),
    clearFormSubmitting: (formId: string) => clearLoading(`form:${formId}:submitting`),
    clearAIProcessing: () => clearLoading('ai:processing'),
    
    // Limpar por grupo
    clearAllForms: () => clearAllLoading('forms'),
    clearAllNavigation: () => clearAllLoading('navigation'),
    clearAllAI: () => clearAllLoading('ai'),
  };
};

// Hook para operações CRUD específicas de recursos com grupos e prioridades
export const useCrudLoadingStates = (resourceName: string) => {
  const { setLoading, isLoading, clearLoading, isAnyLoading, clearAllLoading } = useLoading();
  const resourceGroup = `crud:${resourceName}`;

  return {
    // Estados CRUD com prioridades apropriadas
    setCreating: (loading: boolean, metadata?: Record<string, any>) => 
      setLoading(`${resourceName}:creating`, loading, { 
        priority: LoadingPriority.NORMAL, 
        group: resourceGroup,
        metadata: { operation: 'create', resource: resourceName, ...metadata }
      }),
    setReading: (loading: boolean, metadata?: Record<string, any>) => 
      setLoading(`${resourceName}:reading`, loading, { 
        priority: LoadingPriority.LOW, 
        group: resourceGroup,
        metadata: { operation: 'read', resource: resourceName, ...metadata }
      }),
    setUpdating: (id: string, loading: boolean, metadata?: Record<string, any>) => 
      setLoading(`${resourceName}:${id}:updating`, loading, { 
        priority: LoadingPriority.NORMAL, 
        group: resourceGroup,
        metadata: { operation: 'update', resource: resourceName, id, ...metadata }
      }),
    setDeleting: (id: string, loading: boolean, metadata?: Record<string, any>) => 
      setLoading(`${resourceName}:${id}:deleting`, loading, { 
        priority: LoadingPriority.HIGH, 
        group: resourceGroup,
        metadata: { operation: 'delete', resource: resourceName, id, ...metadata }
      }),
    
    // Verificações de estado
    isCreating: () => isLoading(`${resourceName}:creating`),
    isReading: () => isLoading(`${resourceName}:reading`),
    isUpdating: (id: string) => isLoading(`${resourceName}:${id}:updating`),
    isDeleting: (id: string) => isLoading(`${resourceName}:${id}:deleting`),
    isAnyResourceLoading: () => isAnyLoading(resourceGroup),
    
    // Limpeza
    clearCreating: () => clearLoading(`${resourceName}:creating`),
    clearReading: () => clearLoading(`${resourceName}:reading`),
    clearUpdating: (id: string) => clearLoading(`${resourceName}:${id}:updating`),
    clearDeleting: (id: string) => clearLoading(`${resourceName}:${id}:deleting`),
    clearAllResourceLoading: () => clearAllLoading(resourceGroup),
  };
};

// Hook para loading com debounce e opções avançadas
export const useDebouncedLoading = (
  key: string, 
  delay = 300, 
  options?: LoadingOptions
) => {
  const { setLoading, isLoading } = useLoading();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setDebouncedLoading = useCallback(
    (loading: boolean, overrideOptions?: LoadingOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const finalOptions = { ...options, ...overrideOptions };

      if (loading) {
        // Mostrar loading imediatamente
        setLoading(key, true, finalOptions);
      } else {
        // Atrasar a remoção do loading
        timeoutRef.current = setTimeout(() => {
          setLoading(key, false);
        }, delay);
      }
    },
    [key, delay, setLoading, options]
  );

  // Cleanup do timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    setDebouncedLoading,
    isLoading: isLoading(key),
  };
};

// Hook para métricas e monitoramento de performance
export const useLoadingMetrics = () => {
  const { getLoadingMetrics, getHighestPriority, hasLoadingWithPriority } = useLoading();
  
  return {
    getMetrics: getLoadingMetrics,
    getHighestPriority,
    hasLoadingWithPriority,
    hasCriticalLoading: () => hasLoadingWithPriority(LoadingPriority.CRITICAL),
    hasHighPriorityLoading: () => hasLoadingWithPriority(LoadingPriority.HIGH),
  };
};

// Hook para gerenciamento de loading por prioridade
export const usePriorityLoading = () => {
  const { setLoading, getHighestPriority, hasLoadingWithPriority } = useLoading();
  
  const setLoadingWithPriority = useCallback(
    (key: string, loading: boolean, priority: LoadingPriority, options?: Omit<LoadingOptions, 'priority'>) => {
      setLoading(key, loading, { ...options, priority });
    },
    [setLoading]
  );
  
  return {
    setLoadingWithPriority,
    setCriticalLoading: (key: string, loading: boolean, options?: Omit<LoadingOptions, 'priority'>) =>
      setLoadingWithPriority(key, loading, LoadingPriority.CRITICAL, options),
    setHighPriorityLoading: (key: string, loading: boolean, options?: Omit<LoadingOptions, 'priority'>) =>
      setLoadingWithPriority(key, loading, LoadingPriority.HIGH, options),
    setNormalLoading: (key: string, loading: boolean, options?: Omit<LoadingOptions, 'priority'>) =>
      setLoadingWithPriority(key, loading, LoadingPriority.NORMAL, options),
    setLowPriorityLoading: (key: string, loading: boolean, options?: Omit<LoadingOptions, 'priority'>) =>
      setLoadingWithPriority(key, loading, LoadingPriority.LOW, options),
    getHighestPriority,
    hasLoadingWithPriority,
  };
};

// Exportar enum e tipos para uso externo
export { LoadingPriority };
export type { LoadingEntry,LoadingMetrics, LoadingOptions };

export default LoadingContext;