import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk/clients/all';
// import fs from 'fs';

@Injectable()
export class AwsService {
  private readonly imageBucket = 'music-images';

  private readonly s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
    endpoint: process.env.AWS_ENDPOINT,
  });

  constructor() {}

  async uploadFile(file: Express.Multer.File) {
    // const fileBody = fs.readFileSync(file.path);

    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.imageBucket,
      Body: file.buffer,
      Key: new Date().toISOString().replace(/:/g, '-') + file.originalname,
      ContentType: file.mimetype,
    };
    console.log(uploadParams);
    return this.s3.upload(uploadParams).promise();
  }
}
