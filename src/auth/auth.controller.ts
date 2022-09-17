import {
  Body, Controller, Delete, Ip, Post, Req,
  UnauthorizedException, NotFoundException
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Req() request, @Ip() ip: string, @Body() body: LoginDto) {
    const result = await this.authService.login(
      body.username,
      body.password,
      request.headers['user-agent'],
      ip
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    return result;
  }

  @Post('refresh')
  async refreshToken(@Body() body: RefreshTokenDto) {
    const result = await this.authService.refresh(body.refreshToken);

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Delete('logout')
  async logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }
}
