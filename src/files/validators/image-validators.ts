import { MaxFileSizeValidator } from '@nestjs/common';
import { FileTypeOptionsValidator } from './file-type-options.validator';

export const imageValidators = [
  new FileTypeOptionsValidator(
    ['image/jpeg', 'image/jpg', 'image/png'],
    'image',
  ),
  new MaxFileSizeValidator({
    maxSize: 1024 * 1024 * 5,
    message: 'Max size for image is 5 MB',
  }),
];
