import { FileInterceptor } from '@nestjs/platform-express';
import { IFilesService } from './files.interface';
import {
  Controller,
  Delete,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

@Controller('files')
export class FilesController {
  constructor(
    @Inject(IFilesService) private readonly fileService: IFilesService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadFile(file, {
      file_type: 'image',
      format: file.mimetype.split('/')[1],
    });
  }

  @Delete('delete')
  deleteImage(@Query('id') id: string) {
    return this.fileService.deleteFileById(id);
  }
}
