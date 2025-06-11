import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getWidgetConfig } from '@/config/aiWidgetConfig';

interface ChatState {
  isOpen: boolean;
  config: any;
}

export const useAIChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    config: null
  });
  const location = useLocation();

  const openChat = useCallback(() => {
    const config = getWidgetConfig(location.pathname);
    if (config) {
      setChatState({
        isOpen: true,
        config
      });
    }
  }, [location.pathname]);

  const closeChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const toggleChat = useCallback(() => {
    if (chatState.isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [chatState.isOpen, openChat, closeChat]);

  return {
    isOpen: chatState.isOpen,
    config: chatState.config,
    openChat,
    closeChat,
    toggleChat
  };
};