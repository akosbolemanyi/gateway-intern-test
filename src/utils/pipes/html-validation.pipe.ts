import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class HtmlFileValidationPipe implements PipeTransform {
  private readonly MAX_FILE_SIZE_MB = 5;
  private readonly ALLOWED_FILE_TYPES = ['text/html'];

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    const fileSizeMB = file.size / (1024 * 1024);
    const fileSizeKB = file.size / 1024;

    if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
      throw new BadRequestException(
        `File size exceeds the maximum: ${this.MAX_FILE_SIZE_MB}MB (${fileSizeKB.toFixed(2)}KB)!`,
      );
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_FILE_TYPES.join(', ')}`,
      );
    }

    return file;
  }
}
