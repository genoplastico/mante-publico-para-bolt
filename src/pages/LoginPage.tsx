import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Building2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Gestión de Documentos de Obra
        </h2>
        {isRegistering ? (
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete el formulario para crear su cuenta
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingrese sus credenciales para continuar
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isRegistering ? (
            <RegisterForm
              onSuccess={() => {
                setIsRegistering(false);
                onLogin();
              }}
              onCancel={() => setIsRegistering(false)}
            />
          ) : (
            <>
              <LoginForm onSuccess={onLogin} />
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">¿No tiene una cuenta?</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Registrarse
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}