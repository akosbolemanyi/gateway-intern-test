import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

describe('MovieService', () => {
  let movieService: MovieService;
  let model: Model<Movie>;

  const mockMovie = {
    _id: '61c0ccf11d7bf83d153d7c06',
    title: 'Movie Title',
    description: 'Movie Description',
    coverImages: 'Cover Image',
    isWinner: false,
  };

  const mockMovieService = {
    find: jest.fn(),
    findById: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieService,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    model = module.get<Model<Movie>>(getModelToken(Movie.name));
  });

  /* This is where you should continue! :)
  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const req = {
        query: {
          page: '1',
          search: 'test',
          sort: 'title',
        },
      } as unknown as Request;

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            sort: () => ({
              limit: () => ({
                skip: jest.fn().mockResolvedValue([mockMovie]),
              }),
            }),
          }) as any,
      );

      const result = await movieService.findAll(req); // Baj van a toronyban.

      expect(model.find).toHaveBeenCalledWith({
        title: { $regex: 'test', $options: 'i' },
      });

      expect(result).toEqual([mockMovie]);
    });
  });*/

  describe('findById', () => {
    it('should find and return a movie by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockMovie);

      const result = await movieService.findById(mockMovie._id);

      expect(model.findById).toHaveBeenCalledWith(mockMovie._id);
      expect(result).toEqual(mockMovie);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      const id = 'invalid-id';

      const isValidObjectIDMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(movieService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIDMock).toHaveBeenCalledWith(id);
      isValidObjectIDMock.mockRestore();
    });

    it('should throw NotFoundException if movie is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(movieService.findById(mockMovie._id)).rejects.toThrow(
        BadRequestException,
      );

      expect(model.findById).toHaveBeenCalledWith(mockMovie._id);
    });
  });
});
