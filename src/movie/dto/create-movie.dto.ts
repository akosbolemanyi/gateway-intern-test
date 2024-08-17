import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateMovieDto {
  // @IsNotEmpty()
  // @IsString()
  readonly title: string;

  // @IsString()
  readonly description: string;

  // @IsString()
  coverImage: string;

  // @IsBoolean()
  readonly isWinner: boolean;
}
