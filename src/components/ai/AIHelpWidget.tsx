import React, { useEffect } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AIChatSidebar } from './AIChatSidebar';
import { getWidgetConfig, shouldShowWidget } from '@/config/aiWidgetConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIWidget } from '@/contexts/AIWidgetContext';

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
                  w-14 h-14 rounded-full shadow-lg transition-all duration-300
                  ${state.isOpen 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-blue-600 border border-blue-200'
                  }
                  hover:scale-105 active:scale-95
                  ${state.unreadCount > 0 ? 'animate-pulse' : ''}
                `}
              >
                {state.isOpen ? (
                  state.isMinimized ? <Minimize2 className="h-6 w-6" /> : <X className="h-6 w-6" />
                ) : (
                  <>
                    <MessageCircle className="h-6 w-6" />
                    {state.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {state.unreadCount > 9 ? '9+' : state.unreadCount}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{state.isOpen ? 'Fechar ajuda' : 'Ajuda AI'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Sidebar do Chat */}
      <AnimatePresence>
        {state.isOpen && !state.isMinimized && (
          <AIChatSidebar
            config={state.config}
            onClose={closeWidget}
            onToggleMinimize={toggleMinimize}
            isMinimized={state.isMinimized}
          />
        )}
      </AnimatePresence>
    </>
  );
};