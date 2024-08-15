import { Injectable } from '@nestjs/common';
import {Movie} from "./schemas/movie.schema";
import {InjectModel} from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Injectable()
export class MovieService {
    constructor(
        @InjectModel(Movie.name)
        private movieModel: mongoose.Model<Movie>
    ) {}

    async findAll(): Promise<Movie[]> {
        const movies = await this.movieModel.find();
        return movies;
    }

    async create(movie: Movie): Promise<Movie> {
        const result = await this.movieModel.create(movie);
        return result;
    }
}
