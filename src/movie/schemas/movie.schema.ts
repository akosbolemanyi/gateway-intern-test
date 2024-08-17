import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MovieDocument = Movie & Document;

@Schema({
  timestamps: true,
})
export class Movie {
  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop({ default: false })
  isWinner: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
