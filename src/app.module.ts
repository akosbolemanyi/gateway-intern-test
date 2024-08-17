import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';
import { LoggerMiddleware } from '../utils/logger.middleware';
import { GridfsService } from './gridfs/gridfs.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_MONGO_URI),
    MovieModule,
  ],
  controllers: [AppController],
  providers: [AppService, GridfsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
