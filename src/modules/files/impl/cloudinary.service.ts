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
  async uploadImage(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<Result<FileUploadResult, FileUploadError>> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'default',
            filename_override: file.originalname,
            public_id: options?.id,
            format: file.mimetype.split('/')[1],
            resource_type: 'image',
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

      return ok({
        id: result.public_id,
        url: result.url,
        contentType: 'image',
        filename: result.original_filename,
        date: result.created_at,
        provider: 'CLOUDINARY',
        type: 'image',
        metadata: {
          width: result.width,
          height: result.height,
          format: result.format,
        },
      } as ImageFileUploadResult);
    } catch (error) {
      const uploadErr = error as UploadApiErrorResponse;
      return err({
        success: false,
        message: uploadErr.message || 'Failed to upload file',
        statusCode: uploadErr.http_code || 500,
      } as FileUploadError);
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<Result<FileUploadResult, FileUploadError>> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'default',
            filename_override: file.originalname,
            public_id: options?.id,
            format: file.mimetype.split('/')[1],
            resource_type: 'video',
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

      return ok({
        id: result.public_id,
        url: result.url,
        contentType: 'video',
        filename: result.original_filename,
        date: result.created_at,
        provider: 'CLOUDINARY',
        type: 'video',
        metadata: {
          ...result.metadata,
          format: result.format,
        },
      } as VideoFileUploadResult);
    } catch (error) {
      const uploadErr = error as UploadApiErrorResponse;
      return err({
        success: false,
        message: uploadErr.message || 'Failed to upload file',
        statusCode: uploadErr.http_code || 500,
      } as FileUploadError);
    }
  }

  async uploadGenericFile(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<Result<FileUploadResult, FileUploadError>> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'default',
            filename_override: file.originalname,
            public_id: options?.id,
            format: file.mimetype.split('/')[1],
            resource_type: 'raw',
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

      return ok({
        id: result.public_id,
        url: result.url,
        contentType: result.resource_type,
        filename: result.original_filename,
        date: result.created_at,
        provider: 'CLOUDINARY',
        type: file.mimetype.split('/')[0] as 'document' | 'audio' | 'raw',
        metadata: {
          ...result.metadata,
        },
      } as GenericFileUploadResult);
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
