import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SetupPage } from './pages/admin/SetupPage';
import { SubscribersPage } from './pages/admin/SubscribersPage';
import { PlansPage } from './pages/admin/PlansPage';
import { BillingPage } from './pages/admin/BillingPage';
import { MetricsPage } from './pages/admin/MetricsPage';
import { SupportPage } from './pages/admin/SupportPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { WorkersPage } from './pages/WorkersPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AuthUser } from './types/auth';

interface AppRoutesProps {
  user: AuthUser | null;
}

export function AppRoutes({ user }: AppRoutesProps) {
  if (user?.role === 'owner' || user?.role === 'support') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/subscribers" element={<SubscribersPage />} />
        <Route path="/admin/plans" element={<PlansPage />} />
        <Route path="/admin/billing" element={<BillingPage />} />
        <Route path="/admin/metrics" element={<MetricsPage />} />
        <Route path="/admin/support" element={<SupportPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/workers" element={<WorkersPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}