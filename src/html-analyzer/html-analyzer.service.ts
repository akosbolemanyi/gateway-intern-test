import { Injectable } from '@nestjs/common';

@Injectable()
export class HtmlAnalyzerService {
  async validate(id: string, file: Express.Multer.File): Promise<string> {
    console.log('Ez az ID: ' + id);
    return file.buffer.toString('utf8');
  }
}
