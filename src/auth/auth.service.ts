// auth.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, SocialProvider, User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async kakaoLogin(req) {
    const kakaoUser = req.user.info;

    const user = await this.userService.create({
      socialId: kakaoUser.socialId,
      email: kakaoUser.email,
      name: kakaoUser.name,
      socialProvider: SocialProvider.kakao,
    });

    // JWT 토큰 생성
    // midleware나 guard에서 토큰이 유효한지 검증
    return user;
  }

  // appleLogin()

  // naverLogin()
  async naverLogin(req) {
    const naverUser = req.user.info;

    const user = await this.userService.create({
      socialId: naverUser.socialId,
      email: naverUser.email,
      name: naverUser.name,
      socialProvider: SocialProvider.naver,
    });

    // JWT 토큰 생성
    // midleware나 guard에서 토큰이 유효한지 검증
    return user;
  }

  async socialIdLogin(socialId: string) {
    const user = await this.userRepository.findOne({
      where: {
        socialId,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
    }

    return {
      accessToken: await this.issueToken(user, false),
      refreshToken: await this.issueToken(user, true),
    };
  }

  // ${Bearer token} -> Bearer 토큰 분리해서 검증후 payload 반환
  async parserBearerToken(rawToken: string, isRefresh: boolean) {
    // (1) Bearer 토큰 분리
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length != 2) {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }
    const [bearer, token] = basicSplit;

    if (bearer.toLocaleLowerCase() !== 'bearer') {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }
    try {
      // (2) 디코딩 + 토큰 검증후 payload 반환
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(
          isRefresh
            ? envVariableKeys.refreshTokenSecret
            : envVariableKeys.accessTokenSecret,
        ),
      });

      if (isRefresh) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('Refresh 토큰을 입력해주세요.');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('Access 토큰을 입력해주세요.');
        }
      }

      return payload;
    } catch {
      throw new UnauthorizedException('토큰이 만료 되었습니다.');
    }
  }

  // user 정보를 통해 accessToken , refreshToken 발급
  async issueToken(
    user: { id: number; role: Role; socialId: string },
    isRefresh: boolean,
  ) {
    // 환경변수(.env) ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET 저장
    const accessTokenSecret = this.configService.get<string>(
      envVariableKeys.accessTokenSecret,
    );
    const refreshTokenSecret = this.configService.get<string>(
      envVariableKeys.refreshTokenSecret,
    );

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        socialId: user.socialId,
        type: isRefresh ? 'refresh' : 'access',
      },
      {
        secret: isRefresh ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefresh ? '24h' : '24h',
      },
    );
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저의 ID 입니다.');
    }

    return user;
  }
}
