import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';

const usersArray = [
  { id: '1', username: 'peter', email: 'peter', password: 'peter', lastPasswordResetTime: null },
  { id: '2', username: 'mark', email: 'mark', password: 'mark', lastPasswordResetTime: null },
  { id: '3', username: 'high', email: 'hugh', password: 'hugh', lastPasswordResetTime: null },
] as UserEntity[];

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let usersTest: UserEntity[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockImplementation((username, password, headers: any, ip: string) => {
              const user = usersTest.find(x => x.password === password && x.username === username);
              if (user) {
                return Promise.resolve({
                  refreshToken: "success",
                  accessToken: "success"
                });
              }

              return null;
            }),
            refresh: jest.fn().mockReturnValue(new LoginResponseDto())
          }
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.resetModules() // Most important - it clears the cache
    usersTest = [ ...usersArray ];
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login successful', async () => {
    const login = {
      password: 'peter',
      username: 'peter'
    } as LoginDto;

    const request = {
      headers: {}
    };

    const resp = await controller.login(request, '...:', login);
    
    expect(resp).toBeDefined();
    expect(resp).not.toBeNull();
    expect(resp.accessToken).toBeDefined();
    expect(resp.refreshToken).toBeDefined();
    expect(service.login).toBeCalledTimes(1);
  });

  it('login fail', async () => {
    const login = {
      password: 'peter',
      username: 'ssss'
    } as LoginDto;

    const request = {
      headers: {}
    };

    await expect(() => controller.login(request, '...:', login)).rejects.toThrow("");
  });
});
