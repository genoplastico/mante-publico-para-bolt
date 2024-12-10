import React from 'react';
import { Bell, FileText, User, Building2 } from 'lucide-react';
import type { Notification } from '../../types';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationsList({ notifications, onMarkAsRead }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
        <p className="mt-1 text-sm text-gray-500">¡Todo está al día!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const timeAgo = getTimeAgo(new Date(notification.createdAt));

  return (
    <div
      className={`p-4 ${
        notification.read ? 'bg-white' : 'bg-blue-50'
      } hover:bg-gray-50 transition-colors`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
            {icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
          <div className="mt-2 text-xs text-gray-500">{timeAgo}</div>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="ml-4 rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Marcar como leída
          </button>
        )}
      </div>
    </div>
  );
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'document_expired':
    case 'document_expiring':
      return <FileText className="h-5 w-5 text-blue-600" />;
    case 'worker_added':
      return <User className="h-5 w-5 text-blue-600" />;
    default:
      return <Building2 className="h-5 w-5 text-blue-600" />;
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }
  if (diffInHours > 0) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  if (diffInMinutes > 0) {
    return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  return 'Hace un momento';
}