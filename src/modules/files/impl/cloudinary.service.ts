import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import * as toStream from 'buffer-to-stream';
import { IFilesService } from '../files.interface';
import { FileUploadOptions } from '../configs/file-upload-options';
import {
  FileUploadResult,
  GenericFileUploadResult,
  ImageFileUploadResult,
  VideoFileUploadResult,
} from '../dtos/file-upload-result.dto';
import { FileUploadError } from '../dtos/file-upload-error.dto';
import { err, ok, Result } from 'neverthrow';
import { GenerateUrlDto } from '../dtos/generate-url.dto';

@Injectable()
export class CloudinaryService implements IFilesService {
  async uploadFile(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<Result<FileUploadResult, FileUploadError>> {
    try {
      const fileType = file.mimetype.split('/')[0];
      let resourceType: 'image' | 'video' | 'raw' = 'raw';

      if (fileType === 'image') {
        resourceType = 'image';
      } else if (fileType === 'video' || fileType === 'audio') {
        resourceType = 'video';
      } else {
        resourceType = 'raw';
      }

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'default',
            filename_override: file.originalname,
            public_id: options?.id,
            format: file.originalname.split('.').pop(),
            resource_type: resourceType,
            transformation: {
              width: options?.metadata.width,
              height: options?.metadata.height,
            },
            tags: options?.metadata.tags || [],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        toStream(file.buffer).pipe(upload);
      });

      const baseResult = {
        id: result.public_id,
        url: result.secure_url,
        contentType: resourceType,
        filename: result.original_filename,
        date: result.created_at,
        provider: 'CLOUDINARY',
        type: fileType as 'image' | 'video' | 'document' | 'audio' | 'raw',
      };

      if (result.resource_type === 'image') {
        return ok({
          ...baseResult,
          metadata: {
            width: result.width,
            height: result.height,
            format: result.format,
          },
        } as ImageFileUploadResult);
      } else if (result.resource_type === 'video') {
        return ok({
          ...baseResult,
          metadata: {
            format: result.format,
            duration: result.hasOwnProperty('duration')
              ? result.duration
              : undefined,
          },
        } as VideoFileUploadResult);
      } else {
        return ok({
          ...baseResult,
          metadata: {
            format: result.format,
            ...(result.hasOwnProperty('duration')
              ? { duration: result.duration }
              : {}),
          },
        } as GenericFileUploadResult);
      }
    } catch (error) {
      const uploadErr = error as UploadApiErrorResponse;
      return err({
        success: false,
        message: uploadErr.message || 'Failed to upload file',
        statusCode: uploadErr.http_code || 500,
      } as FileUploadError);
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

  generateFileUrl(
    fileId: string,
    options?: FileUploadOptions,
  ): Result<GenerateUrlDto, FileUploadError> {
    return ok({
      url: cloudinary.utils.url(fileId),
    });
  }
}
