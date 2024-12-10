import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth';
import type { User, UserPermissions } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setUser(user);
    setPermissions(AuthService.getUserPermissions());
    setIsLoading(false);
  }, []);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return AuthService.hasPermission(permission);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setPermissions(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    permissions,
    hasPermission,
    logout
  };
}