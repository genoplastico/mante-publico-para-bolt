import React from 'react';
import { Building2, Users, FileText, Home, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  { path: '/', icon: <Home />, label: 'Panel Principal' },
  { path: '/projects', icon: <Building2 />, label: 'Obras' },
  { path: '/workers', icon: <Users />, label: 'Operarios' },
  { path: '/documents', icon: <FileText />, label: 'Documentos' },
  { path: '/settings', icon: <Settings />, label: 'Configuración' }
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <nav className="p-4 space-y-2">
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2 text-sm rounded-lg ${
        active
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="w-5 h-5 mr-3">{icon}</span>
      {label}
    </button>
  );
}