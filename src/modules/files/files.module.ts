import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './impl/cloudinary.provider';
import { CloudinaryService } from './impl/cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { IFilesService } from './files.interface';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    CloudinaryProvider,
    CloudinaryService,
    {
      provide: IFilesService,
      useClass: CloudinaryService,
    },
  ],
  exports: [CloudinaryProvider, CloudinaryService, IFilesService],
})
export class FilesModule {}
