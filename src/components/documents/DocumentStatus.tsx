import React from 'react';
import { AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import type { Document } from '../../types';

interface DocumentStatusProps {
  document: Document;
  showLabel?: boolean;
}

export function DocumentStatus({ document, showLabel = true }: DocumentStatusProps) {
  const isExpired = document.status === 'expired';
  const isExpiring = document.status === 'expiring_soon';
  const isValid = document.status === 'valid';
  
  if (isExpired) {
    return (
      <span className="inline-flex items-center text-red-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {showLabel && 'Vencido'}
      </span>
    );
  }
  
  if (isExpiring) {
    return (
      <span className="inline-flex items-center text-amber-600">
        <Clock className="w-4 h-4 mr-1" />
        {showLabel && 'Por vencer'}
      </span>
    );
  }
  
  if (isValid) {
    return (
      <span className="inline-flex items-center text-green-600">
        <CheckCircle2 className="w-4 h-4 mr-1" />
        {showLabel && 'Vigente'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-gray-400">
      <HelpCircle className="w-4 h-4 mr-1" />
      {showLabel && 'Estado desconocido'}
    </span>
  );
}