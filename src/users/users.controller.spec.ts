import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const usersArray = [
  new User({ id: '1', username: 'peter', email: 'peter', 'password': 'peter', lastPasswordResetTime: null }),
  new User({ id: '2', username: 'mark', email: 'mark', 'password': 'mark', lastPasswordResetTime: null }),
];

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
