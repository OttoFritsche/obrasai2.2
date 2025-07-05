import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type LoadingMetrics,
  LoadingPriority,
  useAppLoadingStates,
  useCrudLoadingStates,
  useDebouncedLoading,
  useLoading,
  useLoadingMetrics,
  useLoadingOperation,
  usePriorityLoading} from '@/contexts/LoadingContext';

// Componente para demonstrar operações básicas
const BasicLoadingExample = () => {
  const { setLoading, isLoading, isAnyLoading, getLoadingKeys } = useLoading();
  const { executeWithLoading } = useLoadingOperation();

  const simulateOperation = async (duration: number) => {
    await new Promise(resolve => setTimeout(resolve, duration));
    return `Operação concluída em ${duration}ms`;
  };

  const handleBasicLoading = () => {
    setLoading('basic-operation', true, {
      priority: LoadingPriority.NORMAL,
      group: 'examples',
      metadata: { type: 'basic' }
    });
    
    setTimeout(() => {
      setLoading('basic-operation', false);
    }, 2000);
  };

  const handleOperationWithLoading = async () => {
    try {
      const result = await executeWithLoading(
        () => simulateOperation(1500),
        'auto-operation',
        {
          priority: LoadingPriority.HIGH,
          group: 'examples',
          metadata: { type: 'automatic' }
        }
      );
      console.log(result);
    } catch (_error) {
      console.error('Erro na operação:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operações Básicas de Loading</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleBasicLoading}
            disabled={isLoading('basic-operation')}
          >
            {isLoading('basic-operation') ? 'Carregando...' : 'Loading Manual'}
          </Button>
          
          <Button 
            onClick={handleOperationWithLoading}
            disabled={isLoading('auto-operation')}
          >
            {isLoading('auto-operation') ? 'Processando...' : 'Loading Automático'}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Qualquer loading ativo: {isAnyLoading() ? 'Sim' : 'Não'}</p>
          <p>Chaves ativas: {getLoadingKeys().join(', ') || 'Nenhuma'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para demonstrar estados da aplicação
const AppStatesExample = () => {
  const {
    setInitializing,
    isInitializing,
    setNavigating,
    isNavigating,
    setFormSubmitting,
    isFormSubmitting,
    setAIProcessing,
    isAIProcessing,
    isAnyFormSubmitting,
    clearAllForms
  } = useAppLoadingStates();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estados da Aplicação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => {
              setInitializing(true);
              setTimeout(() => setInitializing(false), 3000);
            }}
            disabled={isInitializing()}
            variant={isInitializing() ? 'destructive' : 'default'}
          >
            {isInitializing() ? 'Inicializando...' : 'Simular Inicialização'}
          </Button>
          
          <Button 
            onClick={() => {
              setNavigating(true);
              setTimeout(() => setNavigating(false), 1000);
            }}
            disabled={isNavigating()}
            variant={isNavigating() ? 'destructive' : 'default'}
          >
            {isNavigating() ? 'Navegando...' : 'Simular Navegação'}
          </Button>
          
          <Button 
            onClick={() => {
              setFormSubmitting('example-form', true);
              setTimeout(() => setFormSubmitting('example-form', false), 2000);
            }}
            disabled={isFormSubmitting('example-form')}
            variant={isFormSubmitting('example-form') ? 'destructive' : 'default'}
          >
            {isFormSubmitting('example-form') ? 'Enviando...' : 'Enviar Formulário'}
          </Button>
          
          <Button 
            onClick={() => {
              setAIProcessing(true, { model: 'gpt-4', task: 'analysis' });
              setTimeout(() => setAIProcessing(false), 4000);
            }}
            disabled={isAIProcessing()}
            variant={isAIProcessing() ? 'destructive' : 'default'}
          >
            {isAIProcessing() ? 'IA Processando...' : 'Processar com IA'}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Badge variant={isAnyFormSubmitting() ? 'destructive' : 'secondary'}>
            Formulários: {isAnyFormSubmitting() ? 'Ativos' : 'Inativos'}
          </Badge>
          
          <Button 
            onClick={clearAllForms}
            size="sm"
            variant="outline"
          >
            Limpar Formulários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para demonstrar operações CRUD
const CrudExample = () => {
  const {
    setCreating,
    isCreating,
    setUpdating,
    isUpdating,
    setDeleting,
    isDeleting,
    isAnyResourceLoading,
    clearAllResourceLoading
  } = useCrudLoadingStates('usuarios');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operações CRUD - Usuários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={() => {
              setCreating(true, { name: 'João Silva' });
              setTimeout(() => setCreating(false), 2000);
            }}
            disabled={isCreating()}
            variant={isCreating() ? 'destructive' : 'default'}
          >
            {isCreating() ? 'Criando...' : 'Criar Usuário'}
          </Button>
          
          <Button 
            onClick={() => {
              setUpdating('123', true, { field: 'email' });
              setTimeout(() => setUpdating('123', false), 1500);
            }}
            disabled={isUpdating('123')}
            variant={isUpdating('123') ? 'destructive' : 'default'}
          >
            {isUpdating('123') ? 'Atualizando...' : 'Atualizar #123'}
          </Button>
          
          <Button 
            onClick={() => {
              setDeleting('456', true, { cascade: true });
              setTimeout(() => setDeleting('456', false), 1000);
            }}
            disabled={isDeleting('456')}
            variant={isDeleting('456') ? 'destructive' : 'default'}
          >
            {isDeleting('456') ? 'Deletando...' : 'Deletar #456'}
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <Badge variant={isAnyResourceLoading() ? 'destructive' : 'secondary'}>
            Status: {isAnyResourceLoading() ? 'Operação Ativa' : 'Inativo'}
          </Badge>
          
          <Button 
            onClick={clearAllResourceLoading}
            size="sm"
            variant="outline"
          >
            Limpar Todas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para demonstrar loading com debounce
const DebouncedExample = () => {
  const { setDebouncedLoading, isLoading } = useDebouncedLoading(
    'debounced-search',
    500,
    { priority: LoadingPriority.LOW, group: 'search' }
  );
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    if (value.length > 0) {
      setDebouncedLoading(true);
      // Simular busca
      setTimeout(() => {
        setDebouncedLoading(false);
      }, 800);
    } else {
      setDebouncedLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading com Debounce</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 border rounded"
          />
          {isLoading && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Status: {isLoading ? 'Buscando...' : 'Pronto'}
        </p>
      </CardContent>
    </Card>
  );
};

// Componente para demonstrar prioridades e métricas
const MetricsExample = () => {
  const { getMetrics, getHighestPriority, hasCriticalLoading } = useLoadingMetrics();
  const {
    setCriticalLoading,
    setHighPriorityLoading,
    setNormalLoading,
    setLowPriorityLoading
  } = usePriorityLoading();
  
  const [metrics, setMetrics] = useState<LoadingMetrics | null>(null);

  const updateMetrics = () => {
    setMetrics(getMetrics());
  };

  const simulateWithPriority = (priority: string) => {
    const key = `priority-${priority}`;
    const duration = Math.random() * 3000 + 1000;
    
    switch (priority) {
      case 'critical':
        setCriticalLoading(key, true, { group: 'priority-test' });
        break;
      case 'high':
        setHighPriorityLoading(key, true, { group: 'priority-test' });
        break;
      case 'normal':
        setNormalLoading(key, true, { group: 'priority-test' });
        break;
      case 'low':
        setLowPriorityLoading(key, true, { group: 'priority-test' });
        break;
    }
    
    setTimeout(() => {
      switch (priority) {
        case 'critical':
          setCriticalLoading(key, false);
          break;
        case 'high':
          setHighPriorityLoading(key, false);
          break;
        case 'normal':
          setNormalLoading(key, false);
          break;
        case 'low':
          setLowPriorityLoading(key, false);
          break;
      }
      updateMetrics();
    }, duration);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prioridades e Métricas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <Button 
            onClick={() => simulateWithPriority('critical')}
            variant="destructive"
            size="sm"
          >
            Crítica
          </Button>
          
          <Button 
            onClick={() => simulateWithPriority('high')}
            variant="default"
            size="sm"
          >
            Alta
          </Button>
          
          <Button 
            onClick={() => simulateWithPriority('normal')}
            variant="secondary"
            size="sm"
          >
            Normal
          </Button>
          
          <Button 
            onClick={() => simulateWithPriority('low')}
            variant="outline"
            size="sm"
          >
            Baixa
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <Badge variant={hasCriticalLoading() ? 'destructive' : 'secondary'}>
              Prioridade Máxima: {getHighestPriority() || 'Nenhuma'}
            </Badge>
            
            <Button onClick={updateMetrics} size="sm" variant="outline">
              Atualizar Métricas
            </Button>
          </div>
          
          {metrics && (
            <div className="text-sm space-y-1">
              <p>Total de operações: {metrics.totalOperations}</p>
              <p>Duração média: {metrics.averageDuration.toFixed(0)}ms</p>
              <p>Operações ativas: {metrics.activeOperations}</p>
              {metrics.longestOperation && (
                <p>Operação mais longa: {metrics.longestOperation.key} ({metrics.longestOperation.duration}ms)</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal do exemplo
const LoadingContextExample = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">LoadingContext Otimizado</h1>
        <p className="text-muted-foreground">
          Demonstração das funcionalidades avançadas do sistema de loading
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicLoadingExample />
        <AppStatesExample />
        <CrudExample />
        <DebouncedExample />
      </div>
      
      <MetricsExample />
    </div>
  );
};

export default LoadingContextExample;