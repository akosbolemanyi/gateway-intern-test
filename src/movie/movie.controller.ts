import {Body, Controller, Get, Post} from '@nestjs/common';
import {MovieService} from "./movie.service";
import {Movie} from "./schemas/movie.schema";

@Controller('movies')
export class MovieController {
    constructor(private movieService: MovieService) {}

    @Get()
    async getAllMovies(): Promise<Movie[]> {
        return this.movieService.findAll();
    }

    @Post('new')
    async createMovie(
        @Body()
        movie: Movie,
    ): Promise<Movie> {
        return this.movieService.create(movie);
    }
}
