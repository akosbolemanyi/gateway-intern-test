import { Module } from '@nestjs/common';
import { GridfsService } from './gridfs.service';

@Module({
  providers: [GridfsService],
  exports: [GridfsService],
})
export class GridfsModule {}
