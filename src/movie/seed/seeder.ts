import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieSeeder } from './movie.seeder';
import { Movie, MovieSchema } from '../schemas/movie.schema';
import * as dotenv from 'dotenv';
import * as process from 'process';
dotenv.config();

seeder({
  imports: [
    MongooseModule.forRoot(process.env.DB_MONGO_URI),
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
  ],
}).run([MovieSeeder]);
