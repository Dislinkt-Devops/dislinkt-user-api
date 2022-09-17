import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

const usersArray = [
  { id: '1', username: 'peter', email: 'peter', 'password': 'peter', lastPasswordResetTime: null },
  { id: '2', username: 'mark', email: 'mark', 'password': 'mark', lastPasswordResetTime: null },
] as UserEntity[];

describe('AuthService', () => {
  let service: AuthService;
  let repo: Repository<RefreshTokenEntity>;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          // this is temporary solution
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOneOrFail: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(null),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true)
          }
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn().mockImplementation((email: string) =>
              Promise.resolve(usersArray.find(x => x.email === email))
            ),
            findByUsername: jest.fn().mockImplementation((username: string) =>
              Promise.resolve(usersArray.find(x => x.username === username))
            ),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve(usersArray.find(x => x.id === id))
            )
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<Repository<RefreshTokenEntity>>(getRepositoryToken(RefreshTokenEntity));
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
