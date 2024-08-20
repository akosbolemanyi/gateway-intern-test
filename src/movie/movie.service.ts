import {
  BadRequestException, HttpStatus,
  Injectable, InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Movie } from './schemas/movie.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Request } from 'express';
import * as path from 'path';
import { GridFSService } from './gridfs/gridfs.service';
import * as fs from 'fs';
import * as process from 'process';
import { GridFSBucket } from 'mongodb';

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
    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

    const movie = await this.movieModel.findById(id).exec();

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found!`);
    }
    return movie;
  }

  async create(
    createMovieDto: CreateMovieDto,
    file: Express.Multer.File,
  ): Promise<Movie> {
    if (file) {
      const bucket: GridFSBucket = this.gridFSService.getBucket();
      const uploadStream = bucket.openUploadStream(file.originalname);
      try {
        uploadStream.end(file.buffer);
        createMovieDto.coverImage = file.originalname;
      } catch (error) {
        throw new InternalServerErrorException('Error uploading file!');
      }
    }
    return this.movieModel.create(createMovieDto);
  }

  async getCoverImages() {
    try {
      const bucket = this.gridFSService.getBucket();
      const files = await bucket.find({}).toArray();
      return files.map((file) => ({
        filename: file.filename,
        length: file.length,
        uploadDate: file.uploadDate,
      }));
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving files!',
      };
    }
  }

  async downloadCoverImage(movieId: string): Promise<string> {

    const isValid = mongoose.isValidObjectId(movieId);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

    const movie = await this.findById(movieId);

    if (!movie) {
      throw new NotFoundException('Movie not found!');
    }
    if (!movie.coverImage) {
      throw new NotFoundException('Cover image not found!');
    }

    const bucket = this.gridFSService.getBucket();
    const downloadStream = bucket.openDownloadStreamByName(movie.coverImage);

    if (!downloadStream) {
      throw new NotFoundException('File not found!');
    }

    const filePath = path.join(process.cwd(), 'images', movie.coverImage);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const writeStream = fs.createWriteStream(filePath);

    downloadStream.pipe(writeStream);

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve(`File ${movie.coverImage} saved successfully at ${filePath}.`);
      });
      writeStream.on('error', () => {
        reject(new InternalServerErrorException('Error saving file!'));
      });
    });
  }

  async deleteById(id: string): Promise<Movie> {
    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

    const movie = await this.movieModel.findById(id).exec();

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found!`);
    }

    if (movie.coverImage) {
      const bucket: GridFSBucket = this.gridFSService.getBucket();

      try {
        const fileToDelete = await bucket.find({ filename: movie.coverImage }).toArray();

        if (fileToDelete.length > 0) {
          const fileId = fileToDelete[0]._id;
          await bucket.delete(fileId);
        }
      } catch (error) {
        throw new InternalServerErrorException('Error deleting cover image!');
      }

      const deletedMovie = await this.movieModel.findByIdAndDelete(id).exec();

      if (!deletedMovie) {
        throw new NotFoundException(`Movie with id ${id} not found!`);
      }

      return deletedMovie;
    }
  }

  async updateById(
    id: string,
    updateMovieDto: UpdateMovieDto,
    file?: Express.Multer.File,
  ): Promise<Movie> {
    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) {
      throw new BadRequestException('Please give a valid id!');
    }

    const existingMovie = await this.movieModel.findById(id).exec();

    if (!existingMovie) {
      throw new NotFoundException(`Movie with id ${id} not found!`);
    }

    if (file && existingMovie.coverImage) {
      const bucket: GridFSBucket = this.gridFSService.getBucket();

      try {
        const fileToDelete = await bucket.find({ filename: existingMovie.coverImage }).toArray();

        if (fileToDelete.length > 0) {
          const fileId = fileToDelete[0]._id;
          await bucket.delete(fileId);
        }
      } catch (error) {
        throw new InternalServerErrorException('Error deleting old file!');
      }

      const uploadStream = bucket.openUploadStream(file.originalname);

      try {
        uploadStream.end(file.buffer);
        updateMovieDto.coverImage = file.originalname;
      } catch (error) {
        throw new InternalServerErrorException('Error uploading file!');
      }
    }

    const updatedMovie = await this.movieModel
      .findByIdAndUpdate(id, updateMovieDto, {
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
