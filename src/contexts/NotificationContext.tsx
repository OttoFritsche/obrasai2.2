import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category?: 'obra' | 'despesa' | 'contrato' | 'sistema' | 'sinapi';
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Gerar ID único para notificação
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Adicionar nova notificação
  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar toast para notificações importantes
    if (notificationData.type === 'error' || notificationData.type === 'warning') {
      toast[notificationData.type](notificationData.title, {
        description: notificationData.message,
      });
    }

    // Salvar no localStorage para persistência básica
    try {
      const saved = localStorage.getItem('obrasai-notifications') || '[]';
      const savedNotifications = JSON.parse(saved);
      const updated = [newNotification, ...savedNotifications].slice(0, 50); // Manter apenas 50 mais recentes
      localStorage.setItem('obrasai-notifications', JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao salvar notificação no localStorage:', error);
    }
  }, []);

  // Marcar notificação como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    // Atualizar localStorage
    try {
      const saved = localStorage.getItem('obrasai-notifications') || '[]';
      const savedNotifications = JSON.parse(saved);
      const updated = savedNotifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('obrasai-notifications', JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao atualizar notificação no localStorage:', error);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Atualizar localStorage
    try {
      const saved = localStorage.getItem('obrasai-notifications') || '[]';
      const savedNotifications = JSON.parse(saved);
      const updated = savedNotifications.map((n: Notification) => ({ ...n, read: true }));
      localStorage.setItem('obrasai-notifications', JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao atualizar notificações no localStorage:', error);
    }
  }, []);

  // Remover notificação específica
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    // Atualizar localStorage
    try {
      const saved = localStorage.getItem('obrasai-notifications') || '[]';
      const savedNotifications = JSON.parse(saved);
      const updated = savedNotifications.filter((n: Notification) => n.id !== id);
      localStorage.setItem('obrasai-notifications', JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao remover notificação no localStorage:', error);
    }
  }, []);

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem('obrasai-notifications');
    } catch (error) {
      console.warn('Erro ao limpar notificações no localStorage:', error);
    }
  }, []);

  // Filtrar notificações por categoria
  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(notification => notification.category === category);
  }, [notifications]);

  // Calcular notificações não lidas
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Carregar notificações do localStorage ao inicializar
  useEffect(() => {
    if (user) {
      setLoading(true);
      try {
        const saved = localStorage.getItem('obrasai-notifications');
        if (saved) {
          const savedNotifications = JSON.parse(saved).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp), // Converter string de volta para Date
          }));
          setNotifications(savedNotifications);
        }
      } catch (error) {
        console.warn('Erro ao carregar notificações do localStorage:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  // Adicionar notificações automáticas baseadas em eventos do sistema
  useEffect(() => {
    if (!user) return;

    // Notificação de boas-vindas (apenas uma vez)
    const hasWelcomeNotification = notifications.some(n => n.metadata?.type === 'welcome');
    if (!hasWelcomeNotification) {
      addNotification({
        title: 'Bem-vindo ao ObrasAI!',
        message: 'Sua plataforma de gestão de obras está pronta para uso.',
        type: 'success',
        category: 'sistema',
        metadata: { type: 'welcome' },
      });
    }
  }, [user, notifications.length, addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByCategory,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

// Hook para notificações específicas por categoria
export const useNotificationsByCategory = (category: Notification['category']) => {
  const { getNotificationsByCategory } = useNotifications();
  return getNotificationsByCategory(category);
};

// Hook para adicionar notificações de forma tipada
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  return {
    notifySuccess: (title: string, message: string, category?: Notification['category']) => {
      addNotification({ title, message, type: 'success', category });
    },
    notifyError: (title: string, message: string, category?: Notification['category']) => {
      addNotification({ title, message, type: 'error', category });
    },
    notifyWarning: (title: string, message: string, category?: Notification['category']) => {
      addNotification({ title, message, type: 'warning', category });
    },
    notifyInfo: (title: string, message: string, category?: Notification['category']) => {
      addNotification({ title, message, type: 'info', category });
    },
  };
};

export default NotificationContext;