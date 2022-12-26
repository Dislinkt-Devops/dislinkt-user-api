import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

const usersArray = [
  { id: '1', username: 'peter', email: 'peter', password: 'peter', lastPasswordResetTime: null },
  { id: '2', username: 'mark', email: 'mark', password: 'mark', lastPasswordResetTime: null },
  { id: '3', username: 'high', email: 'hugh', password: 'hugh', lastPasswordResetTime: null },
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
            findOne: jest.fn().mockImplementation((options: FindManyOptions) => {
              for (let key in options.where) {
                return Promise.resolve(
                  usersArray.find(x => x[key] === options.where[key])
                );
              }
            }),
            save: jest.fn().mockImplementation((user: UserEntity) => {
              let usernameExist = usersArray.find(x => x.username === user.username);
              let emailExist = usersArray.find(x => x.email === user.email);
              if (!(usernameExist || emailExist)) {
                user.id = '5';
                usersArray.push(user);
                return Promise.resolve(user);
              } 

              return null;
            }),
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

  it('find user by email', async () => {
    const email = 'peter';
    const user = await service.findByEmail(email);

    expect(user).toBeDefined();
    expect(user.email).toEqual(email);
  });

  it('find user by username', async () => {
    const username = 'peter';
    const user = await service.findByUsername(username);

    expect(user).toBeDefined();
    expect(user.username).toEqual(username);
  });

  it('find user by id', async () => {
    const id = '1';
    const user = await service.findOne(id);

    expect(user).toBeDefined();
    expect(user.id).toEqual(id);
  });

  it('fail to find user by id', async () => {
    const id = '5';
    const user = await service.findOne(id);

    expect(user).toBeUndefined();
  });

  it('succesfull creation', async () => {
    const user = { username: 'john', email: 'john', password: 'john', lastPasswordResetTime: null } as UserEntity;
    const added = await service.save(user);
    expect(added).toBeDefined();
    expect(added.email).toEqual(user.email);
    expect(added.username).toEqual(user.username);
    expect(added.password).toEqual(user.password);
    expect(added.id).toBeDefined();

    expect(usersArray).toContain(added);
  });

  it('fail creation', async () => {
    const user = { username: 'john', email: 'mark', password: 'john', lastPasswordResetTime: null } as UserEntity;
    const added = await service.save(user);
    expect(added).toBeNull();
  });
});
