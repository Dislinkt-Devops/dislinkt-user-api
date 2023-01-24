import {
  Body, Controller, Delete, Ip, Post, Put, Req, UseGuards,
  UnauthorizedException, NotFoundException, ConflictException, Query
} from '@nestjs/common';
import { Get } from '@nestjs/common/decorators';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { AuthGuard } from '@nestjs/passport';

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
  logout(@Body() body: RefreshTokenDto) {
    this.authService.logout(body.refreshToken);
  }

  @Post('register')
  async register(@Body() body: RegistrationDto) {
    try {
      await this.authService.register(body);
    } catch {
      throw new ConflictException('There is already user with same email or username');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('password-change')
  changePassword(@Req() req, @Body() body: PasswordChangeDto) {
    this.authService.changePassword(body, req.user.userId);
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

  @UseGuards(AuthGuard('api-key'))
  @Put('activate')
  activateUser(@Query('id', ParseUUIDPipe) id: string) {
    this.authService.activateUser(id);
  }

  @UseGuards(AuthGuard('api-key'))
  @Get('search')
  searchUsers(@Query('keyword') keyword: string) {
    return this.authService.searchUsers(keyword);
  }
}
