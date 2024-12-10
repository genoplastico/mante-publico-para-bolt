import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { Notification } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
}

export function DashboardLayout({
  children,
  notifications,
  onMarkNotificationAsRead,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        notifications={notifications}
        onMarkNotificationAsRead={onMarkNotificationAsRead}
      />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}