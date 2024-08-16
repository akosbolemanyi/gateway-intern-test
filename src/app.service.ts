import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  logger: Logger;

  constructor() {
    this.logger = new Logger();
  }
  getHello(): string {
    return 'Hello World!';
  }
}
