import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { sign, verify } from 'jsonwebtoken'
import { compare } from 'bcrypt'

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

    private retrieveRefreshToken(
        refreshStr: string,
    ): Promise<RefreshToken | undefined> {
        try {
            const decoded = verify(refreshStr, process.env.JWT_REFRESH_SECRET);
            if (typeof decoded === 'string') {
                return undefined;
            }
            return this.repository.findOne({
                where: {
                    id: decoded.id
                }
            });
        } catch (e) {
            return undefined;
        }
    }

    private async newRefreshAndAccessToken(
        user: User,
        userAgent: string,
        ipAddress: string
    ): Promise<LoginResponseDto> {
        const refreshToken = new RefreshToken({
            userAgent,
            ipAddress,
            userId: user.id
        });

        this.repository.save(refreshToken);

        return {
            refreshToken: refreshToken.sign(),
            accessToken: sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        }
    }

    constructor(
        private readonly userService: UsersService, 
        @InjectRepository(RefreshToken) private repository: Repository<RefreshToken>
    ) { }

    async refresh(refreshStr: string): Promise<LoginResponseDto | undefined> {
        const refreshToken = await this.retrieveRefreshToken(refreshStr);
        if (!refreshToken) {
            return undefined;
        }

        const user = await this.userService.findOne(refreshToken.userId);
        if (!user) {
            return undefined;
        }

        const accessToken = {
            userId: refreshToken.userId,
        };

        return {
            accessToken: sign(accessToken, process.env.JWT_SECRET, { expiresIn: '1h' })
        };
    }

    async login(
        username: string,
        password: string,
        userAgent: string,
        ipAddress: string
    ): Promise<LoginResponseDto | undefined> {
        const user = await this.userService.findByUsername(username);
        if (!user || !await compare(password, user.password)) {
            return undefined;
        }

        return this.newRefreshAndAccessToken(user, userAgent, ipAddress)
    }

    async logout(refreshStr): Promise<void> {
        const refreshToken = await this.retrieveRefreshToken(refreshStr);

        if (!refreshToken) {
            return;
        }
        // delete refreshtoken from db
        this.repository.delete(refreshToken.id);
    }
}
