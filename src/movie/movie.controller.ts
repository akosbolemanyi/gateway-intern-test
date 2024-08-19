import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { GridfsService } from '../gridfs/gridfs.service';
import * as path from 'path';
import * as process from 'process';

@Controller('movies')
export class MovieController {
  private readonly logger = new Logger(MovieController.name);
  constructor(
    private movieService: MovieService,
    private gridfsService: GridfsService,
  ) {}

  @Get()
  async getAllMovies(@Req() req: Request): Promise<Movie[]> {
    return this.movieService.findAll(req);
  }

  @Get('winners')
  async getAllWinners(): Promise<Movie[]> {
    return this.movieService.findWinners();
  }

  @Get(':id')
  async getMovie(@Param('id') id: string): Promise<Movie> {
    return this.movieService.findById(id);
  }

  /**
   * The hidden section is the solution for storing locally.
   */
  @UseInterceptors(
    FileInterceptor(
      'image' /*, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),*/,
    ),
  )
  @Post(['new', ':id/new'])
  async createMovie(
    @Body('data') data: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Movie> {
    this.logger.log(`Received file: ${file.originalname}`);
    this.logger.log(`File size: ${file.size} bytes`);
    this.logger.log(`MIME type: ${file.mimetype}`);
    let createMovieDto: CreateMovieDto;
    try {
      createMovieDto = JSON.parse(data);
    } catch (error) {
      throw new InternalServerErrorException('Invalid JSON format!');
    }
    if (file) {
      const bucket = this.gridfsService.getBucket();
      const uploadStream = bucket.openUploadStream(file.originalname);
      uploadStream.end(file.buffer);

      createMovieDto.coverImage = file.originalname;
    }

    return this.movieService.create(createMovieDto);
  }

  @Get('files/images')
  async getFiles() {
    try {
      const bucket = this.gridfsService.getBucket();
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

  @Get('download/:movieId')
  async downloadMovieCoverImage(
    @Param('movieId') movieId: string,
  ): Promise<string> {
    try {
      const movie = await this.movieService.findById(movieId);
      if (!movie || !movie.coverImage) {
        throw new NotFoundException('Movie or cover image not found');
      }

      const bucket = this.gridfsService.getBucket();
      const downloadStream = bucket.openDownloadStreamByName(movie.coverImage);

      if (!downloadStream) {
        throw new NotFoundException('File not found');
      }

      const filePath = path.join(process.cwd(), 'images', movie.coverImage);

      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      const writeStream = fs.createWriteStream(filePath);

      downloadStream.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          resolve(`File ${movie.coverImage} saved successfully at ${filePath}`);
        });

        writeStream.on('error', (err) => {
          reject(new InternalServerErrorException('Error saving file!'));
        });

        downloadStream.on('error', (err) => {
          reject(new NotFoundException('File not found!'));
        });
      });
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving file');
    }
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: string): Promise<Movie> {
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
