import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectsPage } from './pages/ProjectsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { WorkersPage } from './pages/WorkersPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { AuthService } from './services/auth';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { NotificationsProvider } from './contexts/NotificationsContext';

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: AuthService.isAuthenticated(),
    user: AuthService.getCurrentUser()
  });

  useEffect(() => {
    // Configurar el listener de autenticación
    const unsubscribe = AuthService.initAuthListener((user) => {
      setAuthState({
        isAuthenticated: !!user,
        user
      });
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(() => {
    setAuthState({
      isAuthenticated: true,
      user: AuthService.getCurrentUser()
    });
  }, []);

  if (!authState.isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  // Mostrar pantalla de bienvenida para usuarios sin proyectos asignados
  if (authState.user?.role === 'secondary' && (!authState.user.projectIds || authState.user.projectIds.length === 0)) {
    return (
      <ErrorBoundary>
        <WelcomeScreen />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </ErrorBoundary>
  );
}

export default App;
