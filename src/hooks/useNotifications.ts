import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notifications';
import { AuthService } from '../services/auth';
import type { Notification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      NotificationService.getNotifications(user.id)
        .then(setNotifications)
        .catch(console.error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  return {
    notifications,
    markAsRead
  };
}