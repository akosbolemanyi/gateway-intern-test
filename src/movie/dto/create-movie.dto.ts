import {IsBoolean, IsString} from "class-validator";

export class CreateMovieDto {
    @IsString()
    readonly title: string;

    @IsString()
    readonly description: string;

    @IsString()
    readonly coverImage: string;

    @IsBoolean()
    readonly isWinner: boolean;
}