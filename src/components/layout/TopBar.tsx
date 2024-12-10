import React from 'react';
import { User } from 'lucide-react';
import { NotificationsPopover } from '../notifications/NotificationsPopover';
import type { Notification } from '../../types';

interface TopBarProps {
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
}

export function TopBar({ notifications, onMarkNotificationAsRead }: TopBarProps) {
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
          
          <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <User className="w-5 h-5" />
            <span className="text-sm">Administrador</span>
          </button>
        </div>
      </div>
    </header>
  );
}