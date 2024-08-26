import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly MAX_FILE_SIZE_MB = 0.5;
  private readonly ALLOWED_FILE_TYPES = ['image/png'];

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      return null;
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
