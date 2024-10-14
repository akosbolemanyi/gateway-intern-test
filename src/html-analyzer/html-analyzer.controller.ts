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

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async analyzeHtml(
    @Body('id') id: string,
    @UploadedFile(HtmlFileValidationPipe) file: Express.Multer.File,
  ): Promise<string> {
    return this.htmlAnalyzerService.validate(id, file);
  }
}
