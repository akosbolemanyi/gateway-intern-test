import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './schemas/movie.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {UpdateMovieDto} from "./dto/update-movie.dto";
import {CreateMovieDto} from "./dto/create-movie.dto";
import { Query } from 'express-serve-static-core';

@Injectable()
export class MovieService {
    constructor(
        @InjectModel(Movie.name)
        private movieModel: mongoose.Model<Movie>,
    ) {}

    async findAll(query: Query): Promise<Movie[]> {
        const limit = 5;
        const currentPage = Number(query.page) ?? 1;
        const skip = limit * (currentPage - 1);

        const search = query.keyword ? {
            title: {
                $regex: query.keyword,
                $options: 'i'
            },
        } : {}
        return this.movieModel.find(
            { ...search })
            .limit(limit)
            .skip(skip)
            .exec();
    }

    async findWinners(): Promise<Movie[]> {
        return this.movieModel.find({ winner: true }).exec();
    }

    async findById(id: string): Promise<Movie> {
        const movie = await this.movieModel.findById(id).exec();
        if (!movie) {
            throw new NotFoundException(`Movie with id ${id} not found!`);
        }
        return movie;
    }

    async create(movie: CreateMovieDto): Promise<Movie> {
        return this.movieModel.create(movie);
    }

    async deleteById(id: string): Promise<Movie> {
        const movie = await this.movieModel.findByIdAndDelete(id).exec();
        if (!movie) {
            throw new NotFoundException(`Movie with id ${id} not found!`);
        }
        return movie;
    }

    async updateById(id: string, movie: UpdateMovieDto): Promise<Movie> {
        const updatedMovie = await this.movieModel.findByIdAndUpdate(id, movie, {
            new: true,
            runValidators: true,
        }).exec();
        if (!updatedMovie) {
            throw new NotFoundException(`Movie with id ${id} not found!`);
        }
        return updatedMovie;
    }
}
