import { Injectable, FileValidator } from '@nestjs/common';

@Injectable()
export class FileTypeOptionsValidator extends FileValidator {
  constructor(private acceptableTypes: string[], private fileTypeName: string) {
    super({});
    this.acceptableTypes = acceptableTypes;
    this.fileTypeName = fileTypeName;
  }

  buildErrorMessage(file: any): string {
    return `Provided file is not the type of ${this.fileTypeName}`;
  }
  isValid(file?: any): boolean | Promise<boolean> {
    if (file && this.acceptableTypes.includes(file.mimetype)) return true;
    return false;
  }
}
