import type { Document, DocumentType } from '../../../types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class DocumentValidationService {
  static validateDocument(document: Partial<Document>): ValidationResult {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!document.type) {
      errors.push('El tipo de documento es requerido');
    }
    
    if (!document.name) {
      errors.push('El nombre del documento es requerido');
    }
    
    if (!document.url) {
      errors.push('La URL del documento es requerida');
    }
    
    if (!document.workerId) {
      errors.push('El ID del trabajador es requerido');
    }

    // Validar fecha de vencimiento si existe
    if (document.expiryDate) {
      const expiryDate = new Date(document.expiryDate);
      const now = new Date();
      
      if (isNaN(expiryDate.getTime())) {
        errors.push('La fecha de vencimiento no es válida');
      } else if (expiryDate < now) {
        errors.push('La fecha de vencimiento no puede ser anterior a la fecha actual');
      }
    }

    // Validar tipo de documento
    if (document.type && !this.isValidDocumentType(document.type)) {
      errors.push('El tipo de documento no es válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidDocumentType(type: string): type is DocumentType {
    const validTypes: DocumentType[] = [
      'carnet_salud',
      'cert_seguridad',
      'entrega_epp',
      'recibo_sueldo',
      'cert_dgi',
      'cert_bps',
      'cert_seguro'
    ];
    return validTypes.includes(type as DocumentType);
  }
}