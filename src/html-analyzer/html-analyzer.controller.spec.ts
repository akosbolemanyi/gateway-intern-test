import { Test, TestingModule } from '@nestjs/testing';
import { HtmlAnalyzerController } from './html-analyzer.controller';

describe('HtmlAnalyzerController', () => {
  let controller: HtmlAnalyzerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HtmlAnalyzerController],
    }).compile();

    controller = module.get<HtmlAnalyzerController>(HtmlAnalyzerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
