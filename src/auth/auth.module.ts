import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HeaderApiKeyStrategy } from './strategies/apikey.strategy';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshTokenEntity])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, HeaderApiKeyStrategy]
})
export class AuthModule {}
