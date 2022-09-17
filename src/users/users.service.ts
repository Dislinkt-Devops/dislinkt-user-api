import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private repository: Repository<User>,
    ) { }

    findByEmail(email: string): Promise<User | undefined> {
        return this.repository.findOne({
            where: { email }
        });
    }

    findByUsername(username: string): Promise<User | undefined> {
        return this.repository.findOne({
            where: { username }
        });
    }

    findOne(id: string): Promise<User | undefined> {
        return this.repository.findOne({
            where: { id }
        });
    }
}
