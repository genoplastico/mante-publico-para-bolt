import React, { useState, useCallback, useEffect } from 'react';
import { ProjectsPage } from './pages/ProjectsPage';
import { LoginPage } from './pages/LoginPage';
import { AuthService } from './services/auth';
import type { Notification } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'document_expiring',
      title: 'Documento por vencer',
      message: 'El carnet de salud de Juan Pérez vence en 7 días',
      createdAt: new Date().toISOString(),
      read: false,
      metadata: {
        workerId: '1',
        documentId: '1'
      }
    },
    {
      id: '2',
      type: 'document_expired',
      title: 'Documento vencido',
      message: 'El certificado de BPS ha vencido',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      metadata: {
        documentId: '2',
        projectId: '1'
      }
    }
  ]);

  const handleMarkNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ProjectsPage
      notifications={notifications}
      onMarkNotificationAsRead={handleMarkNotificationAsRead}
    />
  );
}

export default App;
