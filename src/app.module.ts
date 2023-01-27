import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { configuration } from './config';
import { CommonModule } from './common/common.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

let nodeEnv;
if (!process.env.NODE_ENV) {
  nodeEnv = '.development';
} else if (process.env.NODE_ENV === 'production') {
  nodeEnv = '';
} else {
  nodeEnv = '.' + process.env.NODE_ENV;
}
const ENV = nodeEnv;

@Module({
  imports: [
    PrometheusModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${ENV}`,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<TypeOrmModuleOptions>('db'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CommonModule,
  ],
  providers: [],
})
export class AppModule {}
