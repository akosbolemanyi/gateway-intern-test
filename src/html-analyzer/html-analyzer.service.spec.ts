import { Test, TestingModule } from '@nestjs/testing';
import { HtmlAnalyzerService } from './html-analyzer.service';

describe('HtmlAnalyzerService', () => {
  let service: HtmlAnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HtmlAnalyzerService],
    }).compile();

    service = module.get<HtmlAnalyzerService>(HtmlAnalyzerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
