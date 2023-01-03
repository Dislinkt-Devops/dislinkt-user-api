import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { compare } from 'bcrypt'

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dtos/registration.dto';
import { PasswordChangeDto } from './dtos/password-change.dto';
import { UpdateFormDto } from './dtos/update-form.dto';
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
  'J1c2VybmFtZSI6InBldGVyIiwiZW1haWwiOiJwZXRlciIsImlhdCI6MTY2MzUwOTIzOCwiaWQiOiIxIn0.' +
  'w29gMXpSxj2NSikESSiC1frb6scjYm_BidaKxRAXgT8';

describe('AuthService', () => {
  let service: AuthService;
  let repo: Repository<RefreshTokenEntity>;
  let refreshTokensTest: RefreshTokenEntity[] = [];
  let usersTest: UserEntity[] = [];
  const OLD_ENV = process.env;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(RefreshTokenEntity),
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
              Promise.resolve(usersTest.find(x => x.email === email))
            ),
            findByUsername: jest.fn().mockImplementation((username: string) =>
              Promise.resolve(usersTest.find(x => x.username === username))
            ),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve(usersTest.find(x => x.id === id))
            ),
            save: jest.fn().mockImplementation((user: UserEntity) => {
              if (user.id) {
                let index = usersTest.findIndex(x => x.id == user.id);
                if (index != -1) {
                  let usernameExist = usersTest.find(x => x.username === user.username && x.id != user.id);
                  let emailExist = usersTest.find(x => x.email === user.email && x.id != user.id);
                  if (!(usernameExist || emailExist)) {
                    usersTest[index] = user;
                    return Promise.resolve(user);
                  } 
                }
              } else {
                let usernameExist = usersTest.find(x => x.username === user.username);
                let emailExist = usersTest.find(x => x.email === user.email);
                if (!(usernameExist || emailExist)) {
                  user.id = '4';
                  usersTest.push(user);
                  return Promise.resolve(user);
                } 
              }

              return null;
            })
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<Repository<RefreshTokenEntity>>(getRepositoryToken(RefreshTokenEntity));
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV, JWT_SECRET: 'secret', JWT_REFRESH_SECRET: 'secret', HASH_SALT: '10' }; // Make a copy
    usersTest = [ ...usersArray ];
    refreshTokensTest = [ ...refreshTokens ];
  });

  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should be defined', () => {
    expect(service).not.toBeNull()
    expect(service).toBeDefined();
  });

  it('successful refresh', async () => {
    const token = await service.refresh(refreshTokenBase64);
    expect(token).not.toBeNull()
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
    expect(resp).not.toBeNull()
    
    expect(resp.accessToken).toBeDefined();
    expect(resp.accessToken).not.toBeNull()

    expect(resp.refreshToken).toBeDefined();
    expect(resp.refreshToken).not.toBeNull()

    expect(newRefreshToken).toBeDefined();
    expect(newRefreshToken).not.toBeNull()

    expect(newRefreshToken.username).toEqual(username);
    expect(newRefreshToken.userAgent).toEqual(userAgent);
    expect(newRefreshToken.ipAddress).toEqual(ipAddress);
    expect(newRefreshToken.id).toBeDefined();
    expect(newRefreshToken.id).not.toBeNull()
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

  it('successful logout', async () => {
    await service.logout(refreshTokenBase64);
    expect(repo.delete).toHaveBeenCalled()
  });

  it('successful register', async () => {
    const email = 'test@mail.com';
    const password = 'pass';
    const username = 'test';
    const form = {
      email: email,
      password: password,
      passwordConfirm: password,
      username: username
    } as RegistrationDto;
    await service.register(form);
    const newUser = usersTest.find(x => x.id === '4');

    expect(newUser).not.toBeNull();
    expect(newUser).toBeDefined();
    expect(newUser.email).toEqual(email);
    expect(newUser.username).toEqual(username);
    expect(newUser.password).toEqual(password);  
  });

  it('fail register', async () => {
    const email = 'peter';
    const password = 'pass';
    const username = 'test';
    const id = '4';
    const form = {
      email: email,
      password: password,
      passwordConfirm: password,
      username: username
    } as RegistrationDto;
    await service.register(form);
    const newUser = usersTest.find(x => x.id === id);

    expect(newUser).toBeUndefined();
  });

  it('fail register', async () => {
    const email = 'test@mail.com';
    const password = 'pass';
    const username = 'peter';
    const id = '4';
    const form = {
      email: email,
      password: password,
      passwordConfirm: password,
      username: username
    } as RegistrationDto;
    await service.register(form);
    const newUser = usersTest.find(x => x.id === id);

    expect(newUser).toBeUndefined();
  });

  it('change password successful', async () => {
    const password = 'Pass.125';
    const passwordConfirm = 'Pass.125';
    const id = '1';
    const form = {
      password: password,
      passwordConfirm: passwordConfirm,
    } as PasswordChangeDto;
    await service.changePassword(form, id);
    const newUser = usersTest.find(x => x.id === id);

    expect(newUser).not.toBeNull();
    expect(newUser).toBeDefined();
    expect(await compare(password, newUser.password)).toEqual(true);
  });

  it('change password fail', async () => {
    const password = 'Pass.125';
    const passwordConfirm = 'Pass.125';
    const id = '1512';
    const form = {
      password: password,
      passwordConfirm: passwordConfirm,
    } as PasswordChangeDto;

    await expect(() => service.changePassword(form, id)).rejects.toThrow('User no longer exist.');
    const user = usersTest.find(x => x.id === id);
    expect(user).toBeUndefined();
  });

  it('update user successful', async () => {
    const username = 'peter';
    const email = 'peter@mail.com';
    const id = '1';
    const form = {
      username: username,
      email: email,
    } as UpdateFormDto;
    await service.updateUser(form, id);

    const user = usersTest.find(x => x.id === id);
    expect(user).not.toBeNull();
    expect(user).toBeDefined();
    expect(user.email).toEqual(email);
    expect(user.username).toEqual(username);
  });

  it('update user fail', async () => {
    const username = 'high';
    const email = 'peter@mail.com';
    const id = '1';
    const form = {
      username: username,
      email: email,
    } as UpdateFormDto;
    await service.updateUser(form, id);
    
    const user = usersTest.find(x => x.id === id);
    expect(user).toBeDefined();
    expect(user.username).toEqual(username);
  });
});
