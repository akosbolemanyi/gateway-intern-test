import {seeder} from "nestjs-seeder";
import {MongooseModule} from "@nestjs/mongoose";
import {MovieSeeder} from "./movie.seeder";
import process from "node:process";
import {Movie, MovieSchema} from "./schemas/movie.schema";

seeder({
    imports: [
        // Nem fogadja el ezt: MongooseModule.forRoot(process.env.DB_MONGO_URI),
        MongooseModule.forRoot('mongodb://localhost:27017/library-next-api'),
        MongooseModule.forFeature( [{ name: Movie.name, schema: MovieSchema }] )
    ]
}).run([MovieSeeder]);