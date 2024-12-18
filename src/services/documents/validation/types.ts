export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DocumentValidationConfig {
  maxFileSize: number;
  allowedTypes: string[];
  requiredFields: string[];
  dateValidations: {
    allowPastDates: boolean;
    maxFutureMonths: number;
  };
}