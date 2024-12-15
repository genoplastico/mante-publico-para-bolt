import type { DocumentType } from '../../types';

export const EXPIRY_THRESHOLDS = {
  WARNING_DAYS: 15,
  CRITICAL_DAYS: 7
};

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  carnet_salud: 'Carnet de Salud',
  cert_seguridad: 'Certificado de Seguridad',
  entrega_epp: 'Entrega de EPP',
  recibo_sueldo: 'Recibo de Sueldo',
  cert_dgi: 'Certificado DGI',
  cert_bps: 'Certificado BPS',
  cert_seguro: 'Certificado de Seguro'
};