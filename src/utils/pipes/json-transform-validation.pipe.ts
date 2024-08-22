import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validateSync, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransformAndValidatePipe implements PipeTransform {
  constructor(private readonly dtoClass: any) {}

  transform(value: any): any {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        throw new BadRequestException('Invalid JSON format!');
      }
    } else if (typeof value === 'object') {
      throw new BadRequestException('Raw object is not acceptable!');
    } else {
      throw new BadRequestException('Invalid data format!');
    }

    const dtoObject = plainToInstance(this.dtoClass, value);

    const errors: ValidationError[] = validateSync(dtoObject);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      throw new BadRequestException({
        message: 'Validation failed.',
        errors: errorMessages,
      });
    }

    return dtoObject;
  }
}
