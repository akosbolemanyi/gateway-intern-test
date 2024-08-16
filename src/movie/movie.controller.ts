import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Request } from 'express';
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";

@Controller('movies')
export class MovieController {
  constructor(private movieService: MovieService) {}

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

  @Post(['new', ':id/new'])
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async createMovie(@Body() createMovieDto: CreateMovieDto, @UploadedFile() file: Express.Multer.File): Promise<Movie> {
    if (file) {
      console.log('file', file);
      createMovieDto.coverImage = file.originalname;
    }
    return this.movieService.create(createMovieDto);
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
