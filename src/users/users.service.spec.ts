import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

const usersArray = [
  { id: '1', username: 'peter', email: 'peter', 'password': 'peter', lastPasswordResetTime: null },
  { id: '2', username: 'mark', email: 'mark', 'password': 'mark', lastPasswordResetTime: null },
] as UserEntity[];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          // this is temporary solution
          useValue: {
            find: jest.fn().mockResolvedValue(usersArray),
            findOneOrFail: jest.fn().mockResolvedValue(usersArray[0]),
            create: jest.fn().mockReturnValue(usersArray[0]),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true)
          }
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
