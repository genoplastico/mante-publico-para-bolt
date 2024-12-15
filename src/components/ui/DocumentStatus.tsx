import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { Document } from '../../types';

interface DocumentStatusProps {
  document: Document;
  showLabel?: boolean;
  className?: string;
}

export function DocumentStatus({ document, showLabel = true, className = '' }: DocumentStatusProps) {
  const isExpired = document.status === 'expired';
  const isExpiring = document.status === 'expiring_soon';
  const isValid = document.status === 'valid';

  const baseClasses = `inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium ${className}`;
  
  if (isExpired) {
    return (
      <span className={`${baseClasses} bg-red-50 text-red-700`}>
        <AlertCircle className="w-4 h-4" />
        {showLabel && 'Vencido'}
      </span>
    );
  }
  
  if (isExpiring) {
    return (
      <span className={`${baseClasses} bg-amber-50 text-amber-700`}>
        <Clock className="w-4 h-4" />
        {showLabel && 'Por vencer'}
      </span>
    );
  }
  
  return (
    <span className={`${baseClasses} bg-green-50 text-green-700`}>
      <CheckCircle2 className="w-4 h-4" />
      {showLabel && 'Vigente'}
    </span>
  );
}