import React from 'react';
import { Building2, Users, FileText, Home, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <nav className="p-4 space-y-2">
        <SidebarItem icon={<Home />} label="Panel Principal" active />
        <SidebarItem icon={<Building2 />} label="Obras" />
        <SidebarItem icon={<Users />} label="Operarios" />
        <SidebarItem icon={<FileText />} label="Documentos" />
        <SidebarItem icon={<Settings />} label="Configuración" />
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({ icon, label, active }: SidebarItemProps) {
  return (
    <button
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