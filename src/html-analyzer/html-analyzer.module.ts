import { Module } from '@nestjs/common';
import { HtmlAnalyzerService } from './html-analyzer.service';
import { HtmlAnalyzerController } from './html-analyzer.controller';

@Module({
  providers: [HtmlAnalyzerService],
  controllers: [HtmlAnalyzerController]
})
export class HtmlAnalyzerModule {}
