import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class JsonValidationPipe implements PipeTransform {
  transform(value: any): any {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new BadRequestException('Invalid JSON format!');
      }
    } else if (typeof value === 'object') {
      return value;
    } else {
      throw new BadRequestException('Invalid data format!');
    }
  }
}
