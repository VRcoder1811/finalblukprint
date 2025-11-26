export interface UploadedFile {
  id: string;
  file: File;
  pageCount?: number; // Optional, if we want to parse it later
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface CoverSheetData {
  title: string;
  summary: string;
  generatedByAI: boolean;
}