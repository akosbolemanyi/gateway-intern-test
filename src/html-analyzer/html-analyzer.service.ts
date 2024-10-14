import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as pdf from 'pdf-parse';

@Injectable()
export class HtmlAnalyzerService {
  /**
   * This function is not the best optimized. When it comes to multiple languages,
   * this will have to explicitly contain all the different scenarios, which is
   * by no means optimal.
   * @param id
   * @param file
   */
  async validate(id: string, file: Express.Multer.File): Promise<string> {
    console.log('This is the ID: ' + id);
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

  /**
   * Will analyze only the table tags.
   * It is known that the full price is always located at the last row.
   * @param id
   * @param file
   */
  getPrice(id: string, file: Express.Multer.File): string | null {
    console.log('This is the ID: ' + id);
    const content = file.buffer.toString('utf8');
    const $ = cheerio.load(content);

    const lastPriceCell = $('table tr:last-child td:last-child').text().trim();

    if (lastPriceCell) {
      const priceMatch = lastPriceCell.match(/[\d.]+/g);
      if (priceMatch) {
        return priceMatch.join('');
      }
      return 'Price format not recognized!';
    } else {
      return 'Price not found!';
    }
  }

  /**
   * This is a wrong way of analyzing. Cannot be always trusted.
   * The HTML file is needed because of the table tags which can easily help
   * determine the full price on an order.
   * @param id
   * @param file
   */
  async extract(id: string, file: Express.Multer.File): Promise<string> {
    console.log('This is the ID: ' + id);

    const dataBuffer = file.buffer;

    try {
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(
        'ERROR during the analysis of the PDF file: ' + error.message,
      );
    }
  }
}
