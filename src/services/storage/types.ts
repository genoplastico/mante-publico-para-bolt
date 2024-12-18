export interface ImageProcessingOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  preserveExif: boolean;
}