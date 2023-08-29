import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageValidators } from './validators/image-validators';
import { FilesService } from './files.service';
import { audioValidators } from './validators';
import { AuthGuard, Roles } from 'src/auth/guard';

@UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private fileService: FilesService) {}

  @Post('image/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: imageValidators,
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.fileService.uploadImage(image);
  }

  @Post('audio/upload')
  @UseInterceptors(FileInterceptor('audio'))
  uploadAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: audioValidators,
      }),
    )
    audio: Express.Multer.File,
  ) {
    return this.fileService.uploadAudio(audio);
  }

  @Roles(['admin'])
  @Delete('image/delete')
  deleteImage(@Body('image_key') image_key: string) {
    return this.fileService.deleteImage(image_key);
  }
}
