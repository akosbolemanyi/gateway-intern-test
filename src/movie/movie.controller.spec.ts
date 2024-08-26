import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { BadRequestException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MovieController', () => {
  let service: MovieService;
  let controller: MovieController;

  const mockMovie = {
    _id: '61c0ccf11d7bf83d153d7c06',
    title: 'Movie Title',
    description: 'Movie Description',
    isWinner: false,
  };

  const mockMovieService = {
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: mockMovieService,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    controller = module.get<MovieController>(MovieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMovie', () => {
    it('should create a new movie', async () => {
      const data: CreateMovieDto = {
        title: 'New title',
        description: 'New description',
        isWinner: false,
      };

      const dataStr = JSON.stringify(data);

      const file = null;

      mockMovieService.create = jest.fn().mockResolvedValueOnce(mockMovie);

      const result = await controller.createMovie(dataStr, file);

      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(mockMovie);
    });

    describe('createMovie', () => {
      it('should throw BadRequestException if title is empty', async () => {
        const data: CreateMovieDto = {
          title: '',
          description: 'Description',
          isWinner: false,
        };

        const dataStr = JSON.stringify(data);
        const file = null;

        try {
          await controller.createMovie(dataStr, file);
        } catch (error) {
          console.log(
            `TEST - updateMovie: it should throw BadRequestException if title is empty.
Error code: ${error.status} - ${error.message}`,
          );
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toContain('String validation failed.');
        }
      });

      it('should throw BadRequestException if title is missing', async () => {
        const data: Partial<CreateMovieDto> = {
          description: 'Description',
          isWinner: false,
        };

        const dataStr = JSON.stringify(data);
        const file = null;

        try {
          await controller.createMovie(dataStr, file);
        } catch (error) {
          console.log(
            `TEST - updateMovie: it should throw BadRequestException if title is missing.
Error code: ${error.status} - ${error.message}`,
          );
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toContain('String validation failed.');
        }
      });
    });
  });

  describe('updateMovie', () => {
    it('should update a movie successfully', async () => {
      const data: UpdateMovieDto = {
        title: 'New Title',
        description: 'Updated description',
        isWinner: true,
      };

      const dataStr = JSON.stringify(data);
      const file: Express.Multer.File = null;

      mockMovieService.updateById = jest.fn().mockResolvedValueOnce(mockMovie);

      const result = await controller.updateMovie(mockMovie._id, dataStr, file);

      expect(service.updateById).toHaveBeenCalledWith(
        mockMovie._id,
        data,
        file,
      );
      expect(result).toEqual(mockMovie);
    });

    it('should throw BadRequestException if title is empty.', async () => {
      const data: UpdateMovieDto = {
        title: '',
        description: 'Description',
        isWinner: false,
      };

      const dataStr = JSON.stringify(data);
      const file: Express.Multer.File = null;

      try {
        await controller.updateMovie(mockMovie._id, dataStr, file);
      } catch (error) {
        console.log(
          `TEST - updateMovie: it should throw BadRequestException if title is empty.
Error code: ${error.status} - ${error.message}`,
        );
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('String validation failed.');
      }
    });
  });

  /*it('should throw NotFoundException if movie ID is invalid', async () => {
    const validUpdateData: UpdateMovieDto = {
      title: 'Updated Title',
      description: 'Updated description',
      isWinner: true,
    };

    const validUpdateStr = JSON.stringify(validUpdateData);
    const file: Express.Multer.File = null;

    mockMovieService.updateById = jest
      .fn()
      .mockRejectedValueOnce(new NotFoundException('Movie not found'));

    try {
      await controller.updateMovie('invalid-id', validUpdateStr, file);
    } catch (error) {
      console.log(
        'TEST - updateMovie: it should throw NotFoundException if movie ID is invalid\nError code: ' +
          error.status +
          ' - ' +
          error.message,
      );
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toContain('Movie not found');
    }
  });*/

  /*describe('deleteMovie', () => {
    it('should delete a movie successfully', async () => {
      mockMovieService.deleteById = jest.fn().mockResolvedValueOnce(mockMovie);

      const result = await controller.deleteMovie('61c0ccf11d7bf83d153d7c06');

      expect(service.deleteById).toHaveBeenCalledWith(
        '61c0ccf11d7bf83d153d7c06',
      );
      expect(result).toEqual(mockMovie);
    });

    it('should throw BadRequestException if ID is invalid', async () => {
      mockMovieService.deleteById = jest.fn().mockImplementation(() => {
        throw new BadRequestException('Please give a valid id!');
      });

      try {
        await controller.deleteMovie('invalid-id');
      } catch (error) {
        console.log(
          'TEST - deleteMovie: it should throw BadRequestException if ID is invalid\nError code: ' +
            error.status +
            ' - ' +
            error.message,
        );
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('Please give a valid id!');
      }
    });

    it('should throw NotFoundException if movie ID is invalid', async () => {
      mockMovieService.deleteById = jest
        .fn()
        .mockRejectedValueOnce(new NotFoundException('Movie not found...'));

      try {
        await controller.deleteMovie('invalid-id');
      } catch (error) {
        console.log(
          'TEST - deleteMovie: it should throw NotFoundException if movie ID is invalid.\nError code: ' +
            error.status +
            ' - ' +
            error.message,
        );
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('Movie not found');
      }
    });
  });*/
});
