import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const env = process.env;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      entities: [],
      synchronize: true,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
