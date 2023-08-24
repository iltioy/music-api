import { MaxFileSizeValidator } from '@nestjs/common';
import { FileTypeOptionsValidator } from './file-type-options.validator';

export const audioValidators = [
  new FileTypeOptionsValidator(['audio/mp4', 'audio/mpeg'], 'audio'),
  new MaxFileSizeValidator({
    maxSize: 1024 * 1024 * 50,
    message: 'Max size for audio is 50 MB',
  }),
];
