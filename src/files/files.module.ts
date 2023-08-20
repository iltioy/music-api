import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AwsService } from 'src/aws/aws.service';
import { AwsModule } from 'src/aws/aws.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AwsModule,
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 3,
    // }),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class FilesModule {}
