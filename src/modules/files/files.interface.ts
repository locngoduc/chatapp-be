import { FileErrorResponseDto } from './dtos/file-error-response.dto';
import { FileOptionsDto } from './dtos/file-options.dto';
import { FileSuccessResponseDto } from './dtos/file-success-response.dto';

export interface IFilesService {
  uploadFile(
    file: Express.Multer.File,
    options?: FileOptionsDto,
  ): Promise<FileSuccessResponseDto | FileErrorResponseDto>;

  deleteFileById(fileId: string): Promise<void>;

  extractFileIdFromUrl(url: string): string | null;

  generateFileUrl(fileId: string, options?: FileOptionsDto): string;
}

export const IFilesService = Symbol('IFilesService');
