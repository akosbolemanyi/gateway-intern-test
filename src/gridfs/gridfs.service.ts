import { Injectable } from '@nestjs/common';
import {GridFSBucket, MongoClient} from 'mongodb';
import * as process from "process";

@Injectable()
export class GridfsService {
    private readonly client: MongoClient;
    private readonly db;

    constructor() {
        this.client = new MongoClient(process.env.DB_MONGO_URI);
        this.client.connect();
        this.db = this.client.db('mydb');
    }

    getBucket() {
        return new GridFSBucket(this.db);
    }
}
