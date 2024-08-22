import { Injectable } from '@nestjs/common';
import { Movie } from './schemas/movie.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Request } from 'express';
import { GridFSService } from './gridfs/gridfs.service';
import { Types } from 'mongoose';
import { Readable } from 'stream';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: mongoose.Model<Movie>,
    private gridFSService: GridFSService,
  ) {}

  /**
   * Default sort order: winners come first then the others.
   * Both sections are sorted alphabetically independently.
   */
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

    const sort: { [key: string]: 1 | -1 } = {};

    const sortParam = typeof req.query.sort === 'string' ? req.query.sort : '';
    const sortParams: string[] = sortParam.split(',');

    if (sortParams.includes('title')) {
      sort['title'] = 1;
    } else {
      sort['isWinner'] = -1;
      sort['title'] = 1;
    }

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
    return Movie.findAndValidateMovieById(this.movieModel, id);
  }

  async create(
    createMovieDto: CreateMovieDto,
    file: Express.Multer.File,
  ): Promise<Movie> {
    let coverImageID = '';
    if (file) {
      coverImageID = await this.gridFSService.uploadCoverImage(file);
    }

    return this.movieModel.create({
      ...createMovieDto,
      coverImage: coverImageID,
    });
  }

  async getMovieCoverImage(id: string): Promise<Readable> {
    const movie = await Movie.findAndValidateMovieById(this.movieModel, id);
    const objectId = new Types.ObjectId(movie.coverImage);
    return await this.gridFSService.getCoverImageStream(objectId);
  }

  async deleteById(id: string): Promise<Movie> {
    const movie = await Movie.findAndValidateMovieById(this.movieModel, id);

    const deletedMovie = await this.movieModel.findByIdAndDelete(id).exec();

    Movie.throwIfMovieNotFound(deletedMovie, id);

    if (movie.coverImage) {
      try {
        await this.gridFSService.deleteCoverImage(movie.coverImage);
      } catch (error) {
        console.error(`Error deleting cover image ${movie.coverImage}:`, error);
      }
    }

    return deletedMovie;
  }

  async updateById(
    id: string,
    updateMovieDto: UpdateMovieDto,
    file?: Express.Multer.File,
  ): Promise<Movie> {
    const existingMovie = await Movie.findAndValidateMovieById(
      this.movieModel,
      id,
    );

    const movie = updateMovieDto !== null ? updateMovieDto : existingMovie;

    if (file && existingMovie.coverImage) {
      await this.gridFSService.deleteCoverImage(existingMovie.coverImage);
      //movie.coverImage = await this.gridFSService.uploadCoverImage(file);
    }

    const updatedMovie = await this.movieModel
      .findByIdAndUpdate(id, movie, {
        new: true,
        runValidators: true,
      })
      .exec();

    Movie.throwIfMovieNotFound(updatedMovie, id);

    return updatedMovie;
  }
}
