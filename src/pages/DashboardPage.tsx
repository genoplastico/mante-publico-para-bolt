import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
}

function DashboardCard({ title, value, description }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
  );
}

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Obras Activas"
          value="12"
          description="2 requieren atención"
        />
        <DashboardCard
          title="Total Operarios"
          value="156"
          description="23 documentos por vencer"
        />
        <DashboardCard
          title="Documentos Pendientes"
          value="45"
          description="Vence el 20 de abril"
        />
      </div>
    </DashboardLayout>
  );
}