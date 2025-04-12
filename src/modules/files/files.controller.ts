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
    return this.fileService.uploadFile(file);
  }

  @Delete('delete')
  deleteImage(@Query('id') id: string) {
    return this.fileService.deleteFileById(id);
  }

  @Post('generate-url')
  generateUrl(@Query('id') id: string) {
    return this.fileService.generateFileUrl(id);
  }
}
