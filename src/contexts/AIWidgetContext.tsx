import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AIWidgetConfig {
  isEnabled: boolean;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'light' | 'dark' | 'auto';
  showWelcomeMessage: boolean;
  welcomeMessage: string;
  placeholder: string;
  maxMessages: number;
}

export interface AIWidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  config: AIWidgetConfig;
  unreadCount: number;
  lastInteraction: Date | null;
}

interface AIWidgetContextType {
  // Estado
  state: AIWidgetState;
  
  // Ações
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  minimizeWidget: () => void;
  maximizeWidget: () => void;
  toggleMinimize: () => void;
  
  // Configuração
  updateConfig: (config: Partial<AIWidgetConfig>) => void;
  resetConfig: () => void;
  
  // Notificações
  incrementUnreadCount: () => void;
  clearUnreadCount: () => void;
  markAsInteracted: () => void;
}

const defaultConfig: AIWidgetConfig = {
  isEnabled: true,
  position: 'bottom-right',
  theme: 'auto',
  showWelcomeMessage: true,
  welcomeMessage: 'Olá! Como posso ajudar você hoje?',
  placeholder: 'Digite sua mensagem...',
  maxMessages: 50
};

const defaultState: AIWidgetState = {
  isOpen: false,
  isMinimized: false,
  config: defaultConfig,
  unreadCount: 0,
  lastInteraction: null
};

const AIWidgetContext = createContext<AIWidgetContextType | undefined>(undefined);

export interface AIWidgetProviderProps {
  children: ReactNode;
  initialConfig?: Partial<AIWidgetConfig>;
}

/**
 * Provider para o contexto do Widget AI
 * Centraliza todo o estado e lógica relacionada ao widget
 */
export function AIWidgetProvider({ children, initialConfig }: AIWidgetProviderProps) {
  const [state, setState] = useState<AIWidgetState>({
    ...defaultState,
    config: { ...defaultConfig, ...initialConfig }
  });

  // Ações de controle do widget
  const openWidget = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      lastInteraction: new Date()
    }));
  }, []);

  const closeWidget = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      isMinimized: false
    }));
  }, []);

  const toggleWidget = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: false,
      lastInteraction: new Date()
    }));
  }, []);

  const minimizeWidget = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: true
    }));
  }, []);

  const maximizeWidget = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: false,
      lastInteraction: new Date()
    }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
      lastInteraction: new Date()
    }));
  }, []);

  // Ações de configuração
  const updateConfig = useCallback((newConfig: Partial<AIWidgetConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setState(prev => ({
      ...prev,
      config: defaultConfig
    }));
  }, []);

  // Ações de notificação
  const incrementUnreadCount = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: prev.unreadCount + 1
    }));
  }, []);

  const clearUnreadCount = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: 0
    }));
  }, []);

  const markAsInteracted = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastInteraction: new Date(),
      unreadCount: 0
    }));
  }, []);

  const contextValue: AIWidgetContextType = {
    state,
    openWidget,
    closeWidget,
    toggleWidget,
    minimizeWidget,
    maximizeWidget,
    toggleMinimize,
    updateConfig,
    resetConfig,
    incrementUnreadCount,
    clearUnreadCount,
    markAsInteracted
  };

  return (
    <AIWidgetContext.Provider value={contextValue}>
      {children}
    </AIWidgetContext.Provider>
  );
}

/**
 * Hook para usar o contexto do Widget AI
 */
export function useAIWidget() {
  const context = useContext(AIWidgetContext);
  if (context === undefined) {
    throw new Error('useAIWidget deve ser usado dentro de um AIWidgetProvider');
  }
  return context;
}

/**
 * Hook especializado para controle básico do widget
 */
export function useAIWidgetControl() {
  const { state, openWidget, closeWidget, toggleWidget } = useAIWidget();
  
  return {
    isOpen: state.isOpen,
    isEnabled: state.config.isEnabled,
    openWidget,
    closeWidget,
    toggleWidget
  };
}

/**
 * Hook especializado para configuração do widget
 */
export function useAIWidgetConfig() {
  const { state, updateConfig, resetConfig } = useAIWidget();
  
  return {
    config: state.config,
    updateConfig,
    resetConfig
  };
}

/**
 * Hook especializado para notificações do widget
 */
export function useAIWidgetNotifications() {
  const { state, incrementUnreadCount, clearUnreadCount, markAsInteracted } = useAIWidget();
  
  return {
    unreadCount: state.unreadCount,
    lastInteraction: state.lastInteraction,
    incrementUnreadCount,
    clearUnreadCount,
    markAsInteracted
  };
}