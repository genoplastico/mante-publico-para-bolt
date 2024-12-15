import type { DocumentType } from '../../types';

interface DocumentMetadata {
  category: string;
  keywords: string[];
  description: string;
}

export const DOCUMENT_METADATA: Record<DocumentType, DocumentMetadata> = {
  carnet_salud: {
    category: 'documentos_personales',
    keywords: ['salud', 'carnet', 'médico', 'sanitario'],
    description: 'Carnet de salud del trabajador'
  },
  cert_seguridad: {
    category: 'seguridad_laboral',
    keywords: ['seguridad', 'certificado', 'capacitación', 'prevención'],
    description: 'Certificado de seguridad laboral'
  },
  entrega_epp: {
    category: 'seguridad_laboral',
    keywords: ['epp', 'equipo', 'protección', 'seguridad'],
    description: 'Constancia de entrega de equipo de protección personal'
  },
  recibo_sueldo: {
    category: 'documentos_laborales',
    keywords: ['sueldo', 'salario', 'pago', 'recibo'],
    description: 'Recibo de sueldo mensual'
  },
  cert_dgi: {
    category: 'documentos_fiscales',
    keywords: ['dgi', 'impuestos', 'certificado', 'fiscal'],
    description: 'Certificado DGI'
  },
  cert_bps: {
    category: 'documentos_fiscales',
    keywords: ['bps', 'seguridad social', 'certificado'],
    description: 'Certificado BPS'
  },
  cert_seguro: {
    category: 'seguros',
    keywords: ['seguro', 'póliza', 'cobertura'],
    description: 'Certificado de seguro'
  }
};