import { Seeder } from 'nestjs-seeder';
import { InjectModel } from '@nestjs/mongoose';
import { Movie, MovieDocument } from '../schemas/movie.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
//import * as process from 'process';

export class MovieSeeder implements Seeder {
  constructor(
    @InjectModel(Movie.name)
    private readonly movieModel: Model<MovieDocument>,
  ) {}

  drop(): Promise<any> {
    return this.movieModel.deleteMany({});
  }

  async seed(): Promise<any> {
    // const filePath = path.join(process.cwd(), '/src/movie/seed/movies.json');
    const filePath = path.join(__dirname, './movies.json');
    const movies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    return this.movieModel.insertMany(movies);
  }
}
