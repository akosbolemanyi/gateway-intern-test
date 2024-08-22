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
import { FileValidationPipe } from '../utils/pipes/file-validation.pipe';
import { CreateMovieDto } from './dto/create-movie.dto';
import { TransformAndValidatePipe } from '../utils/pipes/json-transform-validation.pipe';

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
    @Body('createData') data: string,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ): Promise<Movie> {
    const movie = new TransformAndValidatePipe(CreateMovieDto).transform(data);
    return this.movieService.create(movie, file);
  }

  @Get(':id/image')
  async getMovieCoverImage(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.movieService.getMovieCoverImage(id);
    res.setHeader('Content-Type', 'image');
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
    @Body('updateData', new TransformAndValidatePipe(UpdateMovieDto))
    data: UpdateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Movie> {
    return this.movieService.updateById(id, data, file);
  }
}
