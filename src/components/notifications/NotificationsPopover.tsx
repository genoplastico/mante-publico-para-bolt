import React from 'react';
import { Bell } from 'lucide-react';
import { NotificationsList } from './NotificationsList';
import type { Notification } from '../../types';

interface NotificationsPopoverProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationsPopover({ notifications, onMarkAsRead }: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Notificaciones</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <NotificationsList
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
            />
          </div>
        </div>
      )}
    </div>
  );
}