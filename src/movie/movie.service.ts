import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Movie } from './schemas/movie.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Request } from 'express';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: mongoose.Model<Movie>,
  ) {}

  async findAll(req: Request): Promise<Movie[]> {
    const limit = 5;
    const currentPage = Number(req.query.page) || 1;
    const skip = limit * (currentPage - 1);

    const search = req.query.search
      ? {
          title: {
            $regex: req.query.search,
            $options: 'i',
          },
        }
      : {};

    const sort: { [key: string]: 1 | -1 } = {
      isWinner: -1,
      title: 1,
    };

    const sortParam = req.query.sort as string | undefined;
    const sortParams = sortParam ? sortParam.split(',') : [];
    sortParams.forEach((param) => {
      if (param === 'title') {
        sort['title'] = 1;
      } else if (param === 'isWinner') {
        sort['isWinner'] = -1;
      }
    });

    return this.movieModel
      .find(search)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async findWinners(): Promise<Movie[]> {
    return this.movieModel.find({ isWinner: true }).exec();
  }

  async findById(id: string): Promise<Movie> {
    const movie = await this.movieModel.findById(id).exec();

    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

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

    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found!`);
    }
    return movie;
  }

  async updateById(id: string, movie: UpdateMovieDto): Promise<Movie> {
    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

    const updatedMovie = await this.movieModel
      .findByIdAndUpdate(id, movie, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!updatedMovie) {
      throw new NotFoundException(`Movie with id ${id} not found!`);
    }
    return updatedMovie;
  }
}
