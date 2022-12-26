import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserEntity) private repository: Repository<UserEntity>,
    ) { }

    findByEmail(email: string): Promise<UserEntity> {
        return this.repository.findOne({
            where: { email }
        });
    }

    findByUsername(username: string): Promise<UserEntity> {
        return this.repository.findOne({
            where: { username }
        });
    }

    findOne(id: string): Promise<UserEntity> {
        return this.repository.findOne({
            where: { id }
        });
    }

    save(newUser: UserEntity): Promise<UserEntity> {
        const entity = Object.assign(new UserEntity(), newUser);
        return this.repository.save(entity);
    }
}
