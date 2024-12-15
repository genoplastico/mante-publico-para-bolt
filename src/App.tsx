import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Navigate } from 'react-router-dom';
import { ProjectsPage } from './pages/ProjectsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { WorkersPage } from './pages/WorkersPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SetupPage } from './pages/admin/SetupPage';
import { LoginPage } from './pages/LoginPage';
import { AuthService } from './services/auth';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { AppRoutes } from './routes';
import type { AuthState } from './types/auth';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: AuthService.isAuthenticated(),
    user: AuthService.getCurrentUser(),
    isLoading: true
  });

  useEffect(() => {
    const unsubscribe = AuthService.initAuthListener((user) => {
      setAuthState({
        isAuthenticated: !!user,
        user,
        isLoading: false
      });
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(() => {
    setAuthState({
      isAuthenticated: true,
      user: AuthService.getCurrentUser(),
      isLoading: false
    });
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <LoginPage onLogin={handleLogin} />
        </BrowserRouter>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes user={authState.user} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;