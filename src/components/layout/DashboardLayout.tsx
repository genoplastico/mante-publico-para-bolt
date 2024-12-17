import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'owner' || user?.role === 'support';

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="flex">
        {isAdmin ? <AdminSidebar /> : <Sidebar role={user?.role} />}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}