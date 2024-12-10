import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

export function StatCard({ icon, label, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center">
        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}