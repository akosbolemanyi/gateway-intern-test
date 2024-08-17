import { Test, TestingModule } from '@nestjs/testing';
import { GridfsService } from './gridfs.service';

describe('GridfsService', () => {
  let service: GridfsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GridfsService],
    }).compile();

    service = module.get<GridfsService>(GridfsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
