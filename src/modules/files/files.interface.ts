import { FileUploadOptions } from './configs/file-upload-options';
import { FileUploadResult } from './dtos/file-upload-result.dto';
import { FileUploadError } from './dtos/file-upload-error.dto';
import { Result } from 'neverthrow';
import { GenerateUrlDto } from './dtos/generate-url.dto';

export interface IFilesService {
  uploadFile(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<Result<FileUploadResult, FileUploadError>>;

  deleteFileById(fileId: string): Promise<void>;

  extractFileIdFromUrl(url: string): string | null;

  generateFileUrl(
    fileId: string,
    options?: FileUploadOptions,
  ): Result<GenerateUrlDto, FileUploadError>;
}

export const IFilesService = Symbol('IFilesService');
