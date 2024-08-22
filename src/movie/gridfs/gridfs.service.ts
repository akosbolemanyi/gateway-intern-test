import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GridFSBucket, MongoClient } from 'mongodb';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';

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
        resolve(filename);
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

  async downloadCoverImage(filename: string): Promise<string> {
    const bucket = this.getBucket();
    const downloadStream = bucket.openDownloadStreamByName(filename);

    if (!downloadStream) {
      throw new NotFoundException('File not found!');
    }

    const filePath = path.join(process.cwd(), 'downloads', filename);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const writeStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      downloadStream.pipe(writeStream);

      writeStream.on('finish', () => {
        resolve(`File ${filename} saved successfully at ${filePath}.`);
      });

      writeStream.on('error', () => {
        reject(new InternalServerErrorException('Error saving file!'));
      });
    });
  }
}
