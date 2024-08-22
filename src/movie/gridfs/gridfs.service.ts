import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';
import * as process from 'process';
import { Readable } from 'stream';

@Injectable()
export class GridFSService {
  private readonly client: MongoClient;
  private readonly db;
  private readonly bucket: GridFSBucket;

  constructor() {
    this.client = new MongoClient(process.env.DB_MONGO_URI);
    this.client.connect();
    this.db = this.client.db('MoviesDB');
    this.bucket = new GridFSBucket(this.db);
  }

  getBucket() {
    return this.bucket;
  }

  async uploadCoverImage(file: Express.Multer.File): Promise<string> {
    const filename = Date.now() + '-' + file.originalname;
    const bucket = this.getBucket();
    const uploadStream = bucket.openUploadStream(filename);

    return new Promise((resolve, reject) => {
      uploadStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        reject(new InternalServerErrorException('Error uploading file!'));
      });

      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.end(file.buffer);
    });
  }

  async deleteCoverImage(filename: string): Promise<void> {
    const bucket = this.getBucket();

    try {
      const fileToDelete = await bucket.find({ filename }).toArray();

      if (fileToDelete.length > 0) {
        const fileId = fileToDelete[0]._id;
        await bucket.delete(fileId);
      } else {
        throw new InternalServerErrorException('Cover image not found!');
      }
    } catch (error) {
      throw new InternalServerErrorException('Error deleting cover image!');
    }
  }

  async getCoverImageStream(objectId: ObjectId): Promise<Readable> {
    const bucket = this.getBucket();
    const downloadStream = bucket.openDownloadStream(objectId);

    return new Promise((resolve, reject) => {
      downloadStream.on('error', () => {
        reject(new InternalServerErrorException('Error retrieving the image!'));
      });
      downloadStream.on('end', () => {
        reject(new NotFoundException('Image not found!'));
      });
      resolve(downloadStream);
    });
  }
}
