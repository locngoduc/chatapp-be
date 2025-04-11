export interface FileOptionsDto {
  folder?: string;
  file_id?: string;
  file_type?: 'image' | 'video' | 'raw';
  format?: string;
  transformation?: {
    width?: number;
    height?: number;
  };
  tags?: string[];
}
