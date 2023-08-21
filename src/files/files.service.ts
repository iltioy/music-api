import { BadRequestException, Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class FilesService {
  constructor(private awsService: AwsService) {}

  async uploadImage(image: Express.Multer.File) {
    const metadata = await this.awsService.uploadFile(image, 'music-images');
    return {
      image_url: metadata.Location,
      image_key: metadata.Key,
    };
  }

  deleteImage(imageKey: string) {
    if (!imageKey) {
      throw new BadRequestException('Image key is required!');
    }
    return this.awsService.deleteFile(imageKey, 'music-images');
  }
}
