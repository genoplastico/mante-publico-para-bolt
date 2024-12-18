import JSZip from 'jszip'; 
import { ref, getDownloadURL, getBlob } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { DocumentService } from './index';
import { DOCUMENT_TYPES } from './constants';
import type { Document, DocumentType } from '../../types';

interface DownloadResult {
  success: boolean;
  documentId: string;
  error?: string;
}

interface DownloadOptions {
  includeExpired?: boolean;
  organizeByType?: boolean;
}

export class DocumentDownloadService {
  static async downloadWorkerDocuments(workerId: string, workerName: string, options: DownloadOptions = {}): Promise<Blob> {
    try {
      let documents: Document[];
      const maxAttempts = 3;
      let attempt = 0;
      
      while (attempt < maxAttempts) {
        try {
          documents = await DocumentService.getWorkerDocuments(workerId);
          if (!documents?.length) {
            attempt++;
            if (attempt === maxAttempts) {
              throw new Error('No se encontraron documentos para el trabajador');
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          break;
        } catch (error) {
          attempt++;
          console.warn(`Attempt ${attempt} failed to fetch documents:`, error);
          if (attempt === maxAttempts) {
            throw new Error('No se pudieron obtener los documentos del trabajador');
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (!documents?.length) {
        throw new Error('No hay documentos disponibles para descargar');
      }
      
      const filteredDocs = options.includeExpired 
        ? documents 
        : documents.filter(doc => doc.status !== 'expired');

      if (filteredDocs.length === 0) {
        throw new Error('No hay documentos para descargar');
      }

      const zip = new JSZip();
      const rootFolder = zip.folder(`documentos_${workerName.replace(/\s+/g, '_')}`);
      
      if (!rootFolder) {
        throw new Error('Error al crear el archivo ZIP');
      }

      const results: DownloadResult[] = [];
      
      for (const doc of filteredDocs) {
        try {
          if (!doc.url) {
            console.error(`Invalid URL for document ${doc.id}`);
            results.push({
              success: false,
              documentId: doc.id,
              error: 'URL inválida'
            });
            continue;
          }

          // Extraer la ruta del storage de la URL
          const pathMatch = doc.url.match(/documents%2F[^?]+/);
          if (!pathMatch) {
            throw new Error('Ruta de archivo inválida');
          }
          
          const path = decodeURIComponent(pathMatch[0].replace('?', ''));
          const storageRef = ref(storage, path);
          
          // Descargar directamente usando el SDK de Firebase Storage
          const blob = await getBlob(storageRef);
          if (!blob) {
            throw new Error('Archivo vacío o inválido');
          }

          // Validar el blob antes de agregarlo
          if (blob.size === 0) {
            throw new Error('El archivo descargado está vacío');
          }

          const filePath = this.getFilePath(doc, options.organizeByType);
          rootFolder.file(filePath, blob);
          
          results.push({
            success: true,
            documentId: doc.id
          });
        } catch (error) {
          console.error(`Error downloading document ${doc.id}:`, error);
          results.push({ 
            success: false,
            documentId: doc.id,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount === 0) {
        throw new Error(
          `No se pudo descargar ningún documento. ${failCount} documentos fallaron.`
        );
      }

      if (failCount > 0) {
        console.warn(`${failCount} documentos no se pudieron descargar:`, 
          results.filter(r => !r.success));
      }

      return await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

    } catch (error) {
      console.error('Error downloading worker documents:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error inesperado al descargar los documentos'
      );
    }
  }

  private static getFilePath(doc: Document, organizeByType?: boolean): string {
    if (organizeByType) {
      const typeFolder = DOCUMENT_TYPES[doc.type as DocumentType] || 'otros';
      const safeName = doc.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      return `${typeFolder}/${safeName}`;
    }
    return doc.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}