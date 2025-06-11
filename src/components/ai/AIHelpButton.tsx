import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWidgetConfig } from '@/config/aiWidgetConfig';
import { useAIChat } from '@/hooks/useAIChat';

export const AIHelpButton: React.FC = () => {
  const location = useLocation();
  const { openChat } = useAIChat();

  const shouldShow = useMemo(() => {
    const config = getWidgetConfig(location.pathname);
    return config !== null;
  }, [location.pathname]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      onClick={() => openChat()}
      variant="outline"
      size="sm"
      className="border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Ajuda IA
    </Button>
  );
};