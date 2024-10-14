import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { HtmlAnalyzerService } from './html-analyzer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { HtmlFileValidationPipe } from '../utils/pipes/html-validation.pipe';

@Controller('html-analyzer')
export class HtmlAnalyzerController {
  constructor(private readonly htmlAnalyzerService: HtmlAnalyzerService) {}

  @UseInterceptors(FileInterceptor('html'))
  @Post('html')
  async analyzeHtml(
    @Body('id') id: string,
    @UploadedFile(HtmlFileValidationPipe) file: Express.Multer.File,
  ): Promise<string> {
    return this.htmlAnalyzerService.getPrice(id, file);
  }

  @UseInterceptors(FileInterceptor('pdf'))
  @Post('pdf')
  async analyzePdf(
    @Body('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.htmlAnalyzerService.extract(id, file);
  }
}
