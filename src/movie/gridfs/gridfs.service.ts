import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';
import * as process from 'process';
import { Readable } from 'stream';
import { Types } from 'mongoose';

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

  async upload(file: Express.Multer.File): Promise<string> {
    const bucket = this.getBucket();
    const uploadStream = bucket.openUploadStream(file.originalname);

    return new Promise((resolve, reject) => {
      uploadStream.on('error', () => {
        reject(new InternalServerErrorException('Error uploading file!'));
      });

      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.end(file.buffer);
    });
  }

  async delete(objectId: Types.ObjectId): Promise<void> {
    const bucket = this.getBucket();

    try {
      await bucket.delete(objectId);
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
