import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { GridFSModule } from './gridfs/gridfs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    GridFSModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
