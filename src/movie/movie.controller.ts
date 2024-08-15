import {Body, Controller, Delete, Get, Param, Patch, Post, Query, Req} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('movies')
export class MovieController {
    constructor(private movieService: MovieService) {}

    @Get()
    async getAllMovies(@Query() query: ExpressQuery): Promise<Movie[]> {
        return this.movieService.findAll(query);
    }

    @Get('winners')
    async getAllWinners(): Promise<Movie[]> {
        return this.movieService.findWinners();
    }

    @Get(':id')
    async getMovie(
        @Param('id') id: string,
    ): Promise<Movie> {
        return this.movieService.findById(id);
    }

    @Post(['new', ':id/new'])
    async createMovieFromDetailPage(
        @Param('id') id: string,
        @Body() createMovieDto: CreateMovieDto,
    ): Promise<Movie> {
        return this.movieService.create(createMovieDto);
    }

    @Delete(':id')
    async deleteMovie(
        @Param('id') id: string,
    ): Promise<Movie> {
        return this.movieService.deleteById(id);
    }

    @Patch(':id')
    async updateMovie(
        @Param('id') id: string,
        @Body() updateMovieDto: UpdateMovieDto,
    ): Promise<Movie> {
        return this.movieService.updateById(id, updateMovieDto);
    }
}
