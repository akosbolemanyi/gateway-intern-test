import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { GridFSService } from './movie/gridfs/gridfs.service';
import { HtmlAnalyzerModule } from './html-analyzer/html-analyzer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_MONGO_URI),
    MovieModule,
    HtmlAnalyzerModule,
  ],
  controllers: [AppController],
  providers: [AppService, GridFSService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
