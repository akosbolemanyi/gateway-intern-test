import {
  Body,
  Controller,
  Delete,
  Get,
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

  @UseInterceptors(FileInterceptor('image'))
  @Post(['new', ':id/new'])
  async createMovie(
    @Body('createData') createMovieDto: CreateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Movie> {
    return this.movieService.create(createMovieDto, file);
  }

  @Get('files/images')
  async getMovieCoverImages() {
    return await this.movieService.getCoverImages();
  }

  @Get('download/:movieId')
  async downloadMovieCoverImage(
    @Param('movieId') movieId: string,
  ): Promise<string> {
    return await this.movieService.downloadCoverImage(movieId);
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: string): Promise<Movie> {
    return this.movieService.deleteById(id);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  async updateMovie(
    @Param('id') id: string,
    @Body('updateData') updateMovieDto: UpdateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Movie> {
    return this.movieService.updateById(id, updateMovieDto, file);
  }
}
