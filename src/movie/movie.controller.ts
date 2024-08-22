import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './schemas/movie.schema';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JsonValidationPipe } from '../utils/pipes/json-validation.pipe';
import { FileValidationPipe } from '../utils/pipes/file-validation.pipe';

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
  @Post()
  async createMovie(
    @Body('createData', JsonValidationPipe) createMovieDto: any, // CreateMovieDto kellene.
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ): Promise<Movie> {
    return this.movieService.create(createMovieDto, file);
  }

  @Get(':id/image')
  async getMovieCoverImage(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.movieService.getMovieCoverImage(id);
    res.setHeader('Content-Type', ['image/png', 'image/jpg', 'image/jpeg']);
    file.pipe(res);
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: string): Promise<Movie> {
    return this.movieService.deleteById(id);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  async updateMovie(
    @Param('id') id: string,
    @Body('updateData', JsonValidationPipe) updateMovieDto: UpdateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Movie> {
    return this.movieService.updateById(id, updateMovieDto, file);
  }
}
