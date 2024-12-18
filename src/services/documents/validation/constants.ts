import type { DocumentValidationConfig } from './types';

export const VALIDATION_CONFIG: DocumentValidationConfig = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  requiredFields: ['type', 'name', 'url', 'workerId'],
  dateValidations: {
    allowPastDates: false,
    maxFutureMonths: 12
  }
};