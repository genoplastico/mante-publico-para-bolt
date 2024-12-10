import React from 'react';
import { Building2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function WelcomeScreen() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          ¡Bienvenido al Sistema!
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <ShieldAlert className="h-16 w-16 text-amber-500" />
            </div>
            <p className="text-gray-700">
              Su cuenta ha sido creada exitosamente. Por favor, espere a que un administrador
              le asigne los permisos correspondientes para acceder al sistema.
            </p>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <button
                onClick={logout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}