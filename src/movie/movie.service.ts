import { Injectable } from '@nestjs/common';
import { Movie } from './schemas/movie.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Request } from 'express';
import { GridFSService } from './gridfs/gridfs.service';
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
    data: CreateMovieDto,
    file?: Express.Multer.File,
  ): Promise<Movie> {
    let coverImageID: string;
    if (file) {
      coverImageID = await this.gridFSService.upload(file);
    }

    return this.movieModel.create({
      ...data,
      coverImage: coverImageID,
    });
  }

  async getCoverImage(id: string): Promise<Readable> {
    const movie = await Movie.findAndValidateMovieById(this.movieModel, id);
    const objectId = new Types.ObjectId(movie.coverImage);
    return await this.gridFSService.getCoverImageStream(objectId);
  }

  async deleteById(id: string): Promise<Movie> {
    const movie = await Movie.findAndValidateMovieById(this.movieModel, id);

    if (movie.coverImage) {
      try {
        const objectId = new Types.ObjectId(movie.coverImage);
        await this.gridFSService.delete(objectId);
      } catch (error) {
        console.error(`Error deleting cover image ${movie.coverImage}:`, error);
      }
    }

    return await this.movieModel.findByIdAndDelete(id).exec();
  }

  async updateById(
    id: string,
    data: UpdateMovieDto,
    file?: Express.Multer.File,
  ): Promise<Movie> {
    const existingMovie = await Movie.findAndValidateMovieById(
      this.movieModel,
      id,
    );

    const updateData: Partial<Movie> = { ...data };

    if (file) {
      if (existingMovie.coverImage) {
        try {
          const objectId = new Types.ObjectId(existingMovie.coverImage);
          await this.gridFSService.delete(objectId);
        } catch (error) {
          console.error(
            `Error deleting cover image ${existingMovie.coverImage}:`,
            error,
          );
        }
      }
      updateData.coverImage = await this.gridFSService.upload(file);
    }

    return await this.movieModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }
}
