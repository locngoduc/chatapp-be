export interface BaseFileUploadResult {
  id: string;
  url: string;
  contentType: string;
  filename: string;
  date: string;
  provider?: string;
}

export interface ImageFileUploadResult extends BaseFileUploadResult {
  type: 'image';
  metadata: {
    width: number;
    height: number;
    format: string;
    [key: string]: any;
  };
}

export interface VideoFileUploadResult extends BaseFileUploadResult {
  type: 'video';
  metadata: {
    duration?: number;
    format: string;
    [key: string]: any;
  };
}

export interface GenericFileUploadResult extends BaseFileUploadResult {
  type: 'document' | 'audio' | 'raw';
  metadata?: {
    [key: string]: any;
  };
}

export type FileUploadResult =
  | ImageFileUploadResult
  | VideoFileUploadResult
  | GenericFileUploadResult;
