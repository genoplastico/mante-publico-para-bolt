import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { storage } from '../config/firebase';
import { AuthService } from './auth';
import { STORAGE_CONFIG } from './storage/config';
import type { ImageProcessingOptions } from './storage/types';

interface UploadOptions {
  disableScaling?: boolean;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

import { getStorageErrorMessage } from '../utils/errorUtils';

export class StorageService {
  static async uploadFile(file: File, path: string, options: UploadOptions = {}): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !AuthService.hasPermission('uploadDocument')) {
        throw new Error('No tiene permisos para subir archivos');
      }

      // Validar archivo
      const validationError = this.validateFile(file, STORAGE_CONFIG.maxFileSize);
      if (validationError) {
        throw new Error(validationError);
      }

      let fileToUpload = file;
      
      // Procesar imagen si es una imagen y no se deshabilitó el escalado
      if (!options.disableScaling && file.type.startsWith('image/')) {
        try {
          const processingOptions: ImageProcessingOptions = {
            maxSizeMB: options.maxSizeMB || STORAGE_CONFIG.defaultMaxSizeMB,
            maxWidthOrHeight: options.maxWidthOrHeight || STORAGE_CONFIG.defaultMaxWidthOrHeight,
            useWebWorker: true,
            preserveExif: true,
          };
          
          const imageFile = await StorageService.processImage(file, processingOptions);
          fileToUpload = imageFile;
          
          console.log('Image processed:', {
            originalSize: file.size,
            compressedSize: imageFile.size,
            reduction: `${((file.size - imageFile.size) / file.size * 100).toFixed(2)}%`
          });
        } catch (error) {
          console.warn('Error processing image:', error);
          // Si falla el procesamiento, verificar si el archivo original cumple con el límite
          if (file.size > STORAGE_CONFIG.maxFileSize) {
            throw new Error(`El archivo excede el tamaño máximo permitido (${STORAGE_CONFIG.maxFileSize / (1024 * 1024)}MB)`);
          }
          fileToUpload = file;
        }
      }

      const storageRef = ref(storage, path);
      
      try {
        const snapshot = await uploadBytes(storageRef, fileToUpload, {
          customMetadata: {
            uploadedBy: user.id,
            role: user.role
          }
        });
        const url = await getDownloadURL(snapshot.ref);
        return url;
      } catch (uploadError: any) {
        console.error('Firebase Storage upload error:', uploadError);
        if (uploadError.code === 'storage/unauthorized') {
          throw new Error(`No tiene permisos para subir archivos. Error: ${uploadError.message}`);
        }
        if (uploadError.code === 'storage/network-error') {
          throw new Error('Error de conexión. Por favor, verifique su conexión e intente nuevamente.');
        }
        const errorMessage = getStorageErrorMessage(uploadError);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error inesperado al subir el archivo');
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !AuthService.hasPermission('deleteDocument')) {
        throw new Error('No tiene permisos para eliminar archivos');
      }

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('No se pudo eliminar el archivo');
    }
  }

  static generateFilePath(workerId: string, fileName: string): string {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop() || '';
    const baseName = fileName.split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    const sanitizedFileName = `${baseName}.${extension}`;
    return `documents/${workerId}/${timestamp}-${sanitizedFileName}`;
  }

  static validateFile(file: File, maxSize: number): string | null {
    // Validar tamaño
    if (file.size > maxSize) {
      return `El archivo no debe superar los ${maxSize / (1024 * 1024)}MB`;
    }

    // Validar tipo de archivo
    if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos PDF, JPG o PNG';
    }

    return null;
  }
  
  static isValidUrl(url?: string): boolean {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private static async processImage(file: File, options: ImageProcessingOptions): Promise<File> {
    try {
      const compressedFile = await imageCompression(file, options);
      
      // Si el archivo comprimido es más grande que el original, usar el original
      if (compressedFile.size > file.size) {
        console.warn('Compressed file is larger than original, using original file');
        return file;
      }
      
      return compressedFile;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error inesperado al subir el archivo');
    }
  }
}