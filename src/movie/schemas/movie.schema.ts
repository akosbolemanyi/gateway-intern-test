import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';

export type MovieDocument = Movie & Document;

@Schema({
  timestamps: true,
})
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop()
  coverImage: string;

  @Prop({ default: false })
  isWinner: boolean;

  static validateObjectId(id: string): void {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Please give a valid id!');
    }
  }

  static throwIfMovieNotFound(movie: Movie, id: string): void {
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found!`);
    }
  }

  static async findAndValidateMovieById(
    movieModel: mongoose.Model<Movie>,
    id: string,
  ): Promise<Movie> {
    this.validateObjectId(id);
    const movie = await movieModel.findById(id).exec();
    this.throwIfMovieNotFound(movie, id);
    return movie;
  }
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
