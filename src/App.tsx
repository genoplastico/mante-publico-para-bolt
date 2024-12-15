import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <LoginPage onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  // Redirigir a la página de configuración si no hay owner configurado
  if (authState.user?.role === 'owner' && window.location.pathname !== '/admin/setup') {
    return <Navigate to="/admin/setup" replace />;
  }

  // Mostrar pantalla de bienvenida para usuarios sin proyectos asignados
  if ((authState.user?.role === 'viewer' || authState.user?.role === 'collaborator') && 
      (!authState.user.projectIds || authState.user.projectIds.length === 0)) {
    return (
      <ErrorBoundary>
        <WelcomeScreen />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {authState.user?.role === 'owner' || authState.user?.role === 'support' ? (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/setup" element={<SetupPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/workers" element={<WorkersPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;