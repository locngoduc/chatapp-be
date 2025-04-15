export interface FileUploadOptions {
  path?: string;
  id?: string;
  contentType?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    tags?: string[];
  };
}
