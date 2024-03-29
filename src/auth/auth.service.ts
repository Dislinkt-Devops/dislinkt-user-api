import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken'
import { compare } from 'bcrypt'

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationDto } from './dtos/registration.dto';
import { PasswordChangeDto } from './dtos/password-change.dto';
import { UpdateFormDto } from './dtos/update-form.dto';
import { UserRoles } from '../users/entities/user-roles.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService, 
        @InjectRepository(RefreshTokenEntity) private repository: Repository<RefreshTokenEntity>
    ) {}

    private retrieveRefreshToken(
        refreshStr: string,
    ): Promise<RefreshTokenEntity> {
        try {
            const decoded = verify(refreshStr, process.env.JWT_REFRESH_SECRET);
            if (typeof decoded === 'string') {
                return null;
            }
            return this.repository.findOne({
                where: {
                    id: decoded.id
                }
            });
        } catch (e) {
            return null;
        }
    }

    private async newRefreshAndAccessToken(
        user: UserEntity,
        userAgent: string,
        ipAddress: string
    ): Promise<LoginResponseDto> {
        const { id: userId, username, email, role, isActive } = user;
        const refreshToken = {
            userAgent,
            ipAddress,
            userId,
            username,
            email
        } as RefreshTokenEntity;

        const savedRefToken = await this.repository.save(refreshToken);
        const accessToken = { userId, username, email, role: UserRoles[role] as string, isActive }; 

        return {
            refreshToken: sign(savedRefToken, process.env.JWT_REFRESH_SECRET),
            accessToken: sign(accessToken, process.env.JWT_SECRET, { expiresIn: '1h' })
        }
    }

    async refresh(refreshStr: string): Promise<LoginResponseDto> {
        const refreshToken = await this.retrieveRefreshToken(refreshStr);
        if (!refreshToken) {
            return null;
        }

        const user = await this.userService.findOne(refreshToken.userId);
        if (!user) {
            return null;
        }

        const accessToken = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: UserRoles[user.role] as string,
            isActive: user.isActive
        };

        return {
            accessToken: sign(accessToken, process.env.JWT_SECRET, { expiresIn: '1h' }),
            refreshToken: refreshStr
        };
    }

    async login(
        username: string,
        password: string,
        userAgent: string,
        ipAddress: string
    ): Promise<LoginResponseDto> {
        const user = await this.userService.findByUsername(username);
        if (!user || !await compare(password, user.password)) {
            return null;
        }

        return this.newRefreshAndAccessToken(user, userAgent, ipAddress)
    }

    async logout(refreshStr: string): Promise<void> {
        const refreshToken = await this.retrieveRefreshToken(refreshStr);

        if (!refreshToken) {
            return;
        }
        // delete refreshtoken from db
        this.repository.delete(refreshToken.id);
    }

    async register(registrationForm: RegistrationDto): Promise<void> {
        const user = {
            username: registrationForm.username,
            email: registrationForm.email,
            password: registrationForm.password
        } as UserEntity;

        await this.userService.save(user);
    }

    async changePassword(passwordChangeForm: PasswordChangeDto, userId: string): Promise<void> {
        const user = await this.userService.findOne(userId);
        if (user) {
            const assignedUser = Object.assign(new UserEntity(), user);
            await assignedUser.updatePassword(passwordChangeForm.password);
            await this.userService.save(assignedUser);
        } else {
            throw new UnauthorizedException('User no longer exist.');
        }
    }

    async updateUser(updateForm: UpdateFormDto, userId: string): Promise<void> {
        const user = await this.userService.findOne(userId);
        user.email = updateForm.email;
        user.username = updateForm.username;
        await this.userService.save(user);
    }

    async activateUser(userId: string): Promise<void> {
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new NotFoundException('User with given Id does not exits.');
        }

        user.isActive = true;
        await this.userService.save(user);
    }

    async searchUsers(keyword: string): Promise<string[]> {
        return (await this.userService.findByUsernameLike(keyword)).map(x => x.id); 
    }
}
