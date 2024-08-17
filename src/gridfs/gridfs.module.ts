import { Module } from '@nestjs/common';
import { GridfsService } from './gridfs.service';

@Module({
    providers: [GridfsService],
    exports: [GridfsService],  // Ez biztosítja, hogy más modulok is használhassák
})
export class GridfsModule {}
