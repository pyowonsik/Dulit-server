import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TestBed } from '@automock/jest';
import { SocialProvider, User } from 'src/user/entity/user.entity';
import { RegisterDto } from './dto/register-dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    authController = unit;
    authService = unitRef.get(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user', () => {
      const token = 'Basic dsivjoxicjvsdf';
      const result = { id: 1, email: 'test@codefactory.ai' };

      const registerDto: RegisterDto = { name: '홍길동' };

      jest.spyOn(authService, 'register').mockResolvedValue(result as User);

      expect(authController.registerUser(token, registerDto)).resolves.toEqual(
        result,
      );
      expect(authService.register).toHaveBeenCalledWith(token, registerDto);
    });
  });

  describe('loginUser', () => {
    it('should loign a user', async () => {
      const token = 'Basic asdivjoxicjv';
      const result = {
        refreshToken: 'mocked.refresh.token',
        accessToken: 'mocked.access.token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(authController.loginUser(token)).resolves.toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(token);
    });
  });

  // describe('kakaoLoginCallback', () => {
  //   it('should call kakaoLogin with the provided kakaoAccessToken', async () => {
  //     const kakaoAccessToken = 'test-access-token';
  //     const accessToken = 'access';
  //     const refreshToken = 'refresh';
  //     const user = {
  //       socialId: 'kakao-id',
  //       email: 'test@codefactory.ai',
  //       name: '홍길동',
  //       socialProvider: SocialProvider.kakao,
  //     };

  //     // // authService.kakaoLogin이 호출될 때 반환될 값 설정
  //     // jest.spyOn(authService, 'kakaoLogin').mockResolvedValue(
  //     //   {
  //     //     accessToken,
  //     //     refreshToken,
  //     //   }
  //     // );

  //     // kakaoLoginCallback 호출
  //     const result = await authController.kakaoLoginCallback(kakaoAccessToken);

  //     // kakaoLogin이 예상대로 호출되었는지 검증
  //     expect(authService.kakaoLogin).toHaveBeenCalledWith(kakaoAccessToken);

  //     // 최종 반환값 검증
  //     expect(result).toEqual(user);
  //   });
  // });

  describe('rotateAccessToken', () => {
    it('should rotate access token', async () => {
      const accessToken = 'mocked.access.token';

      jest.spyOn(authService, 'issueToken').mockResolvedValue(accessToken);

      const result = await authController.rotateAccessToken({ user: 'a' });

      expect(authService.issueToken).toHaveBeenCalledWith('a', false);
      expect(result).toEqual({ accessToken });
    });
  });
});
