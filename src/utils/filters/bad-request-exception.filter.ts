import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse() as any;

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exceptionResponse.message || 'Bad Request',
      errors: exceptionResponse.errors || [],
      timestamp: new Date().toISOString(),
    });
  }
}
