import { VALIDATION_CONFIG } from './constants';
import type { ValidationResult } from './types';

export function validateExpiryDate(expiryDate?: string): ValidationResult {
  const errors: string[] = [];
  
  if (!expiryDate) return { isValid: true, errors };

  const date = new Date(expiryDate);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    errors.push('La fecha de vencimiento no es válida');
    return { isValid: false, errors };
  }

  if (!VALIDATION_CONFIG.dateValidations.allowPastDates && date < now) {
    errors.push('La fecha de vencimiento no puede ser anterior a la fecha actual');
  }

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + VALIDATION_CONFIG.dateValidations.maxFutureMonths);
  
  if (date > maxDate) {
    errors.push(`La fecha de vencimiento no puede ser superior a ${VALIDATION_CONFIG.dateValidations.maxFutureMonths} meses`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateFileSize(size: number): ValidationResult {
  return {
    isValid: size <= VALIDATION_CONFIG.maxFileSize,
    errors: size > VALIDATION_CONFIG.maxFileSize 
      ? [`El archivo no debe superar los ${VALIDATION_CONFIG.maxFileSize / (1024 * 1024)}MB`]
      : []
  };
}

export function validateFileType(type: string): ValidationResult {
  return {
    isValid: VALIDATION_CONFIG.allowedTypes.includes(type),
    errors: VALIDATION_CONFIG.allowedTypes.includes(type)
      ? []
      : ['Tipo de archivo no permitido']
  };
}