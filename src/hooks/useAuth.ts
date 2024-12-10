import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setUser(user);
    setIsLoading(false);
  }, []);

  const isSuperUser = user?.role === 'super';

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperUser
  };
}