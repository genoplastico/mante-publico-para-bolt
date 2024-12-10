import React, { createContext, useContext, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../types';

interface NotificationsContextType {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { notifications, markAsRead } = useNotifications();

  const value = {
    notifications,
    markAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
}