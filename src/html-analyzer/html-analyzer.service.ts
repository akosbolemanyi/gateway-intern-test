import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class HtmlAnalyzerService {
  async validate(id: string, file: Express.Multer.File): Promise<string> {
    console.log('Ez az ID: ' + id);
    const content = file.buffer.toString('utf8');
    const $ = cheerio.load(content);
    return $('table tbody tr')
      .filter((i, el) => {
        return $(el).find('td').first().text().trim() === 'Ár';
      })
      .find('td')
      .last()
      .text()
      .trim();
  }
}
