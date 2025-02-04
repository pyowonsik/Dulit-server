// auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entity/user.entity';
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
  ) {}

  async kakaoLogin(req) {
    const kakaoUser = req.user.info;

    const user = await this.userService.create({
      kakaoId: kakaoUser.kakaoId,
      email: kakaoUser.email,
      name: kakaoUser.name,
    });

    // JWT 토큰 생성
    // midleware나 guard에서 토큰이 유효한지 검증
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
    user: { id: number; role: Role; kakaoId: string },
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
        kakaoId: user.kakaoId,
        type: isRefresh ? 'refresh' : 'access',
      },
      {
        secret: isRefresh ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefresh ? '24h' : '24h',
      },
    );
  }
}
