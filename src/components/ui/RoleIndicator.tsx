import React from 'react';
import { Shield, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function RoleIndicator() {
  const { isSuperUser } = useAuth();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
      isSuperUser 
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isSuperUser ? (
        <>
          <Shield className="w-4 h-4 mr-1" />
          Administrador
        </>
      ) : (
        <>
          <ShieldAlert className="w-4 h-4 mr-1" />
          Usuario
        </>
      )}
    </div>
  );
}