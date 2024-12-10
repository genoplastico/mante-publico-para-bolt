import React from 'react';
import { User, LogOut } from 'lucide-react';
import { NotificationsPopover } from '../notifications/NotificationsPopover';
import { RoleIndicator } from '../ui/RoleIndicator';
import { useAuth } from '../../hooks/useAuth';
import type { Notification } from '../../types';

interface TopBarProps {
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
}

export function TopBar({ notifications, onMarkNotificationAsRead }: TopBarProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Gestión de Documentos de Obra
        </h1>
        
        <div className="flex items-center space-x-4">
          <NotificationsPopover
            notifications={notifications}
            onMarkAsRead={onMarkNotificationAsRead}
          />
          
          <div className="flex items-center space-x-4">
            <RoleIndicator />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}