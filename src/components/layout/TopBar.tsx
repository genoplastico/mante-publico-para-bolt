import React from 'react';
import { LogOut } from 'lucide-react';
import { RoleIndicator } from '../ui/RoleIndicator';
import { useAuth } from '../../hooks/useAuth';

export function TopBar() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {user?.role === 'owner' || user?.role === 'support' 
              ? 'Panel de Administración SaaS'
              : 'Gestión de Documentos de Obra'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <RoleIndicator />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}