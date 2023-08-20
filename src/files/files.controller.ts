import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageValidators } from './validators/image-validators';
import { FilesService } from './files.service';

// @UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private fileService: FilesService) {}

  @Post('upload/image')
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
}
