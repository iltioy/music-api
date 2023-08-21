import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk/clients/all';
import { DeleteObjectRequest } from 'aws-sdk/clients/clouddirectory';
// import fs from 'fs';

@Injectable()
export class AwsService {
  // private readonly imageBucket = 'music-images';

  private readonly s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
    endpoint: process.env.AWS_ENDPOINT,
  });

  constructor() {}

  async uploadFile(file: Express.Multer.File, bucketName: string) {
    // const fileBody = fs.readFileSync(file.path);

    const uploadParams: S3.PutObjectRequest = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: new Date().toISOString().replace(/:/g, '-') + file.originalname,
      ContentType: file.mimetype,
    };
    console.log(uploadParams);
    return this.s3.upload(uploadParams).promise();
  }

  async deleteFile(fileKey: string, bucketName: string) {
    const deleteParams: S3.DeleteObjectRequest = {
      Bucket: bucketName,
      Key: fileKey,
    };

    return this.s3.deleteObject(deleteParams).promise();
  }
}
