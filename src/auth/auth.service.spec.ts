import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

const usersArray = [
  { id: '1', username: 'peter', email: 'peter', password: '$2a$10$4eDNuBBhn9t95hm/LLS9GeoErDqK4/TsHxrg..bq1IO0jUvhD0uau', lastPasswordResetTime: null },
  { id: '2', username: 'mark', email: 'mark', password: '$2a$10$PnYwwZpdIfyquQmVWursuOhJ2kFzd3F.mLeP3cU0V15oCtiVzlgPO', lastPasswordResetTime: null },
  { id: '3', username: 'high', email: 'hugh', password: '$2a$10$D9hoNmXZC8TF/dMPHwzAyefrJ6U6aIAB4hl.0FITesruegSwXL7XW', lastPasswordResetTime: null },
] as UserEntity[];

const refreshTokens = [
  { id: '1', userId: '1', username: 'peter', email: 'peter', userAgent: 'agent', ipAddress: '..:'}
] as RefreshTokenEntity[];

const refreshTokenBase64 = 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJ1c2VyQWdlbnQiOiJhZ2VudCIsImlwQWRkcmVzcyI6Ii4uOiIsInVzZXJJZCI6IjEiLC' +
  'J1c2VybmFtZSI6InBldGVyIiwiZW1haWwiOiJwZXRlciIsImlhdCI6MTY2MzUwOTIzOH0.' +
  'Q_sWbTscCE5JY2l6vHy1CkiKEvrrEVzMS1XAGbZlhZ4';

describe('AuthService', () => {
  let service: AuthService;
  let repo: Repository<RefreshTokenEntity>;
  let refreshTokensTest = [];
  const OLD_ENV = process.env;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          // this is temporary solution
          useValue: {
            findOne: jest.fn().mockImplementation((options: FindManyOptions) => {
              for (let key in options.where) {
                return Promise.resolve(
                  refreshTokensTest.find(x => x[key] === options.where[key])
                );
              }
            }),
            save: jest.fn().mockImplementation((refreshToken: RefreshTokenEntity) => {
                refreshToken.id = '2';
                refreshTokensTest.push(refreshToken);
                return Promise.resolve(refreshToken);
            }),
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
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV, JWT_SECRET: 'secret', JWT_REFRESH_SECRET: 'secret' }; // Make a copy
    refreshTokensTest = [ ...refreshTokens ];
  });

  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('successful refresh', async () => {
    const token = await service.refresh(refreshTokenBase64);
    expect(token).toBeDefined();
  });

  it('successful login', async () => {
    const username = 'mark';
    const password = 'mark';
    const userAgent = 'agent';
    const ipAddress = '1.1.1.1';
    const resp = await service.login(
      username, password, userAgent, ipAddress
    );
    const newRefreshToken = refreshTokensTest.find(x => x.username === username);

    expect(resp).toBeDefined();
    expect(resp.accessToken).toBeDefined();
    expect(resp.refreshToken).toBeDefined();
    expect(newRefreshToken).toBeDefined();
    expect(newRefreshToken.username).toEqual(username);
    expect(newRefreshToken.userAgent).toEqual(userAgent);
    expect(newRefreshToken.ipAddress).toEqual(ipAddress);
    expect(newRefreshToken.id).toBeDefined();
  });

  it('fail login', async () => {
    const username = 'mark';
    const password = 'marksw';
    const userAgent = 'agent';
    const ipAddress = '1.1.1.1';
    const resp = await service.login(
      username, password, userAgent, ipAddress
    );
    const newRefreshToken = refreshTokensTest.find(x => x.username === username);

    expect(resp).toBeNull();
    expect(newRefreshToken).toBeUndefined();
  });
});
