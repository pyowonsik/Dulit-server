import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { Role, SocialProvider, User } from 'src/user/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register-dto';
import { v4 as uuidv4 } from 'uuid';

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockUserService = {
  create: jest.fn(),
  socialJoinAndLogin: jest.fn(),
};

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('123456'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const rawToken = 'Basic abcd';
      const registerDto: RegisterDto = {
        name: '홍길동',
      };

      const user = {
        ...registerDto,
        email: 'test@codefactory.ai',
        password: '12341234',
        socialId: '123456',
        socialProvider: SocialProvider.common,
      };

      jest.spyOn(authService, 'parserBasicToken').mockReturnValue({
        email: user.email,
        password: user.password,
      });

      // mockUserService.create를 모킹하여 user 객체를 반환하도록 설정
      jest.spyOn(userService, 'create').mockResolvedValue(user as User);

      // 실제 register 메소드 호출
      const result = await authService.register(rawToken, registerDto);

      // 메소드가 제대로 호출되었는지 검증
      expect(authService.parserBasicToken).toHaveBeenCalledWith(rawToken);
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        email: user.email,
        password: user.password,
        socialId: '123456',
        socialProvider: SocialProvider.common,
      });
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const rawToken = 'Basic asdf';
      const email = 'test@codefactory.ai';
      const password = '123123';
      const user = { id: 1, role: Role.user };

      jest
        .spyOn(authService, 'parserBasicToken')
        .mockReturnValue({ email, password });
      jest.spyOn(authService, 'authenticate').mockResolvedValue(user as User);
      jest.spyOn(authService, 'issueToken').mockResolvedValue('mocked.token');

      const result = await authService.login(rawToken);

      expect(authService.parserBasicToken).toHaveBeenCalledWith(rawToken);
      expect(authService.authenticate).toHaveBeenCalledWith(email, password);
      expect(authService.issueToken).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        refreshToken: 'mocked.token',
        accessToken: 'mocked.token',
      });
    });
  });

  describe('parseBasicToken', () => {
    it('should parse a valid Basic Token', () => {
      const rawToken = 'Basic dGVzdEBleGFtcGxlLmNvbToxMjM0NTY=';
      const result = authService.parserBasicToken(rawToken);

      const decode = { email: 'test@example.com', password: '123456' };

      expect(result).toEqual(decode);
    });

    it('should throw an error for invalid token format', () => {
      const rawToken = 'InvalidTokenFormat';
      expect(() => authService.parserBasicToken(rawToken)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid Basic token format', () => {
      const rawToken = 'Bearer InvalidTokenFormat';
      expect(() => authService.parserBasicToken(rawToken)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid Basic token format', () => {
      const rawToken = 'basic a';
      expect(() => authService.parserBasicToken(rawToken)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseBearerToken', () => {
    it('should parse a valid Bearer Token', async () => {
      const rawToken = 'Bearer token';
      const payload = { type: 'access' };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(configService, 'get').mockReturnValue('secret');

      const result = await authService.parserBearerToken(rawToken, false);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
        secret: 'secret',
      });
      expect(result).toEqual(payload);
    });

    it('should throw a BadRequestException for invalid Bearer token format', () => {
      const rawToken = 'a';
      expect(authService.parserBearerToken(rawToken, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a BadRequestException for token not starting with Bearer', () => {
      const rawToken = 'Basic a';
      expect(authService.parserBearerToken(rawToken, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a BadRequestException if payload.type is not refresh but isRefreshToken parameter is true', () => {
      const rawToken = 'Bearer a';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        type: 'refresh',
      });

      expect(authService.parserBearerToken(rawToken, false)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw a BadRequestException if payload.type is not refresh but isRefreshToken parameter is true', () => {
      const rawToken = 'Bearer a';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        type: 'access',
      });

      expect(authService.parserBearerToken(rawToken, true)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('authenticate', () => {
    it('should autehtnicate a user with correct credentials', async () => {
      const email = 'test@codefactory.ai';
      const password = '123123';
      const user = {
        email: 'test@codefactory.ai',
        password: 'hashedpassword',
      };

      // 과정은 보다 결과
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation((a, b) => true);

      const result = await authService.authenticate(email, password);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: user.email,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);

      expect(result).toEqual(user);
    });
  });

  it('should throw an error for not existing user', async () => {
    const email = 'test@codefactory.ai';
    const password = '123123';

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    expect(authService.authenticate(email, password)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw an error for not existing user', async () => {
    const user = {
      email: 'test@@codefactory.ai',
      password: 'hashedpassword',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
    jest.spyOn(bcrypt, 'compare').mockImplementation((a, b) => false);

    await expect(
      authService.authenticate('test@codefactory.ai', 'a'),
    ).rejects.toThrow(BadRequestException);
  });

  describe('issueToken', () => {
    const user = { id: 1, role: Role.user };
    const token = 'token';

    beforeEach(() => {
      jest.spyOn(configService, 'get').mockReturnValue('secret');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);
    });

    it('should issue an access token', async () => {
      const result = await authService.issueToken(user as User, false);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, type: 'access', role: user.role },
        { secret: 'secret', expiresIn: 300 },
      );
      expect(result).toBe(token);
    });

    it('should issue an access token', async () => {
      const result = await authService.issueToken(user as User, true);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, type: 'refresh', role: user.role },
        { secret: 'secret', expiresIn: '24h' },
      );
      expect(result).toBe(token);
    });
  });

  describe('getMe', () => {
    it('should return a me by myId', async () => {
      const me = {
        id: 1,
        email: 'test@test.com',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(me as User);

      const result = await authService.getMe(me.id);

      expect(result).toEqual(me);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });
    // NotFoundException
    it('should throw NotFoundException if me is not found ', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(authService.getMe(999)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });
  });
});
