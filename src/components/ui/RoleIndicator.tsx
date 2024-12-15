import React from 'react';
import { Shield, ShieldAlert, Building2, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { SaasRole } from '../../types/auth';

const ROLE_LABELS: Record<SaasRole, { label: string; icon: JSX.Element; colors: string }> = {
  owner: {
    label: 'Propietario',
    icon: <Shield className="w-4 h-4 mr-1" />,
    colors: 'bg-purple-100 text-purple-800'
  },
  support: {
    label: 'Soporte',
    icon: <ShieldAlert className="w-4 h-4 mr-1" />,
    colors: 'bg-blue-100 text-blue-800'
  },
  subscriber: {
    label: 'Suscriptor',
    icon: <Building2 className="w-4 h-4 mr-1" />,
    colors: 'bg-green-100 text-green-700'
  },
  collaborator: {
    label: 'Colaborador',
    icon: <Users className="w-4 h-4 mr-1" />,
    colors: 'bg-yellow-100 text-yellow-800'
  },
  viewer: {
    label: 'Visualizador',
    icon: <Users className="w-4 h-4 mr-1" />,
    colors: 'bg-gray-100 text-gray-800'
  }
};

export function RoleIndicator() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const roleConfig = ROLE_LABELS[user.role];
  if (!roleConfig) return null;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${roleConfig.colors}`}>
      {roleConfig.icon}
      {roleConfig.label}
    </div>
  );
}