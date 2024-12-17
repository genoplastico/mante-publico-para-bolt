import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  BarChart,
  Building2,
  Headphones,
  ScrollText
} from 'lucide-react';

const ADMIN_MENU_ITEMS = [
  { path: '/admin', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/admin/subscribers', icon: <Building2 />, label: 'Suscriptores' },
  { path: '/admin/plans', icon: <ScrollText />, label: 'Planes' },
  { path: '/admin/billing', icon: <CreditCard />, label: 'Facturación' },
  { path: '/admin/metrics', icon: <BarChart />, label: 'Métricas' },
  { path: '/admin/support', icon: <Headphones />, label: 'Soporte' },
  { path: '/admin/users', icon: <Users />, label: 'Usuarios' },
  { path: '/admin/settings', icon: <Settings />, label: 'Configuración' },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Panel de Administración
        </h2>
      </div>
      <nav className="space-y-1 px-2">
        {ADMIN_MENU_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center w-full px-4 py-2 text-sm rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="w-5 h-5 mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}