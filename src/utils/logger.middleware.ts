import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, resp: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;

    const originalSend = resp.send;
    let responseBody = '';

    resp.send = (body: any) => {
      responseBody = body;
      return originalSend.call(resp, body);
    };

    resp.on('finish', () => {
      const { statusCode } = resp;

      let logLevel: 'log' | 'warn' | 'error' = 'log';
      let message: string;

      if (statusCode >= 500) {
        logLevel = 'error';
        message = `SERVER-SIDE ISSUES! ${method} | URL:${originalUrl} | STATUS CODE: ${statusCode} | IP: ${ip}`;
      } else if (statusCode >= 400) {
        logLevel = 'warn';
        message = `CLIENT-SIDE ISSUES! ${method} | URL:${originalUrl} | STATUS CODE: ${statusCode} | IP: ${ip}`;
      } else {
        logLevel = 'log';
        message = `${method} | URL:${originalUrl} | STATUS CODE: ${statusCode} | IP: ${ip}`;
      }

      this.logger[logLevel](message);

      if (statusCode >= 400) {
        try {
          const parsedBody = JSON.parse(responseBody);
          if (parsedBody.message) {
            this.logger[logLevel](`Error Message: ${parsedBody.message}`);
          }
        } catch {
          this.logger[logLevel](`Error Message: ${responseBody}`);
        }
      }
    });

    next();
  }
}
