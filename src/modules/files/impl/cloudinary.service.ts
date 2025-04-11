import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import * as toStream from 'buffer-to-stream';
import { IFilesService } from '../files.interface';
import { FileOptionsDto } from '../dtos/file-options.dto';
import { FileSuccessResponseDto } from '../dtos/file-success-response.dto';
import { FileErrorResponseDto } from '../dtos/file-error-response.dto';

@Injectable()
export class CloudinaryService implements IFilesService {
  async uploadFile(
    file: Express.Multer.File,
    options?: FileOptionsDto,
  ): Promise<FileSuccessResponseDto | FileErrorResponseDto> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            filename_override: file.originalname,
            folder: options?.folder || 'default',
            public_id: options?.file_id,
            format: options?.format || 'auto',
            resource_type: options?.file_type || 'raw',
            transformation: options?.transformation,
            tags: options?.tags || [],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        toStream(file.buffer).pipe(upload);
      });

      return {
        file_id: result.public_id,
        url: result.url,
        format: result.format,
        original_filename: result.original_filename,
        width: result.width,
        height: result.height,
        file_type: result.resource_type,
        created_at: result.created_at,
      } as FileSuccessResponseDto;
    } catch (error) {
      const err = error as UploadApiErrorResponse;
      return {
        success: false,
        message: err.message || 'Failed to upload file',
        statusCode: err.http_code || 500,
      } as FileErrorResponseDto;
    }
  }

  deleteFileById(fileId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(fileId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  extractFileIdFromUrl(url: string): string | null {
    throw new Error('Method not implemented.');
  }

  generateFileUrl(fileId: string, options?: FileOptionsDto): string {
    return cloudinary.utils.url(fileId, {
      transformation: {
        ...options?.transformation,
      },
    });
  }
}
