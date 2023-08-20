import { Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class FilesService {
  constructor(private awsService: AwsService) {}

  uploadImage(image: Express.Multer.File) {
    return this.awsService.uploadFile(image);
  }
}
