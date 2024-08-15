import { Injectable } from '@nestjs/common';

@Injectable()
export class MovieService {
    constructor(private readonly movieService: MovieService) {}
}
