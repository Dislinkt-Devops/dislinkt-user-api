import {
  Body, Controller, Delete, Ip, Post, Put, Req, UseGuards,
  UnauthorizedException, NotFoundException, ConflictException
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { PasswordChangeDto } from './dtos/password-change.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegistrationDto } from './dtos/registration.dto';
import { UpdateFormDto } from './dtos/update-form.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Post('register')
  async register(@Body() body: RegistrationDto) {
    try {
      return await this.authService.register(body);
    } catch {
      throw new ConflictException('There is already user with same email or username');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('password-change')
  async changePassword(@Req() req, @Body() body: PasswordChangeDto) {
    return await this.authService.changePassword(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-user')
  async updateUser(@Req() req, @Body() body: UpdateFormDto) {
    try {
      return await this.authService.updateUser(body, req.user.userId);
    } catch {
      throw new ConflictException('There is already user with same email or username');
    }
  }
}
