import React, { useState, useEffect } from 'react';
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
import { getWidgetConfig, shouldShowWidget, type WidgetConfig } from '@/config/aiWidgetConfig';
import { motion, AnimatePresence } from 'framer-motion';

export function AIHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const location = useLocation();

  // Atualizar configuração baseada na rota
  useEffect(() => {
    const config = getWidgetConfig(location.pathname);
    setWidgetConfig(config);
  }, [location.pathname]);

  // Verificar se deve mostrar o widget
  if (!shouldShowWidget(location.pathname) || !widgetConfig) {
    return null;
  }

  const toggleWidget = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
    setIsMinimized(false);
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
                onClick={toggleWidget}
                className={`
                  w-14 h-14 rounded-full shadow-lg transition-all duration-300
                  ${isOpen 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-blue-600 border border-blue-200'
                  }
                  hover:scale-105 active:scale-95
                `}
              >
                {isOpen ? (
                  isMinimized ? <Minimize2 className="h-6 w-6" /> : <X className="h-6 w-6" />
                ) : (
                  <MessageCircle className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isOpen ? 'Fechar ajuda' : widgetConfig.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Sidebar do Chat */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <AIChatSidebar
            config={widgetConfig}
            onClose={closeWidget}
            onToggleMinimize={() => setIsMinimized(!isMinimized)}
            isMinimized={isMinimized}
          />
        )}
      </AnimatePresence>
    </>
  );
};