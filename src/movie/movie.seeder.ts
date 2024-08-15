import {DataFactory, Seeder} from "nestjs-seeder";
import {InjectModel} from "@nestjs/mongoose";
import {Movie, MovieDocument} from "./schemas/movie.schema";
import {Model, Promise} from "mongoose";

export class MovieSeeder implements Seeder {
    constructor(
        @InjectModel(Movie.name)
        private readonly movieModel: Model<MovieDocument>
    ) {}

    drop(): Promise<any> {
        return this.movieModel.deleteMany({});
    }

    seed(): Promise<any> {
        const movies: any = DataFactory.createForClass(Movie).generate(50);
        return this.movieModel.insertMany(movies);
    }
}