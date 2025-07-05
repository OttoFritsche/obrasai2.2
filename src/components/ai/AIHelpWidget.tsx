import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Minimize2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getWidgetConfig, shouldShowWidget } from '@/config/aiWidgetConfig';
import { useAIWidget } from '@/contexts/AIWidgetContext';

import { AIChatSidebar } from './AIChatSidebar';

export function AIHelpWidget() {
  const { state, toggleWidget, closeWidget, toggleMinimize, updateConfig } = useAIWidget();
  const location = useLocation();

  // Atualizar configuração baseada na rota
  useEffect(() => {
    const routeConfig = getWidgetConfig(location.pathname);
    if (routeConfig) {
      updateConfig({
        showWelcomeMessage: routeConfig.showWelcomeMessage,
        welcomeMessage: routeConfig.welcomeMessage || state.config.welcomeMessage,
        placeholder: routeConfig.placeholder || state.config.placeholder
      });
    }
  }, [location.pathname, updateConfig, state.config.welcomeMessage, state.config.placeholder]);

  // Verificar se deve mostrar o widget
  if (!shouldShowWidget(location.pathname) || !state.config.isEnabled) {
    return null;
  }

  const handleToggle = () => {
    if (state.isOpen && !state.isMinimized) {
      toggleMinimize();
    } else {
      toggleWidget();
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleToggle}
                className={`
                  w-16 h-16 rounded-full shadow-2xl transition-all duration-300
                  ${state.isOpen 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }
                  hover:scale-110 active:scale-95
                  ${state.unreadCount > 0 ? 'animate-pulse' : ''}
                  relative overflow-hidden group
                `}
              >
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                
                {/* Ícone principal */}
                <div className="relative flex items-center justify-center">
                  {state.isOpen ? (
                    state.isMinimized ? (
                      <Minimize2 className="h-8 w-8 text-white" />
                    ) : (
                      <X className="h-8 w-8 text-white" />
                    )
                  ) : (
                    <>
                      <Bot className="h-8 w-8 text-white" />
                      {state.unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                          {state.unreadCount > 9 ? '9+' : state.unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Animação de pulso quando fechado */}
                {!state.isOpen && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-medium">
              <p>{state.isOpen ? 'Fechar assistente' : '🤖 Assistente IA ObrasAI'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Sidebar do Chat */}
      <AnimatePresence>
        {state.isOpen && !state.isMinimized && (
          <AIChatSidebar
            isOpen={state.isOpen}
            config={state.config}
            onClose={closeWidget}
            onToggleMinimize={toggleMinimize}
            isMinimized={state.isMinimized}
          />
        )}
      </AnimatePresence>
    </>
  );
}