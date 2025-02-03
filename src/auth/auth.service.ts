// auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService : UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async kakaoLogin(req) {
    const kakaoUser = req.user.info;

    const user = await this.userService.create({
      kakaoId : kakaoUser.kakaoId,
      email : kakaoUser.email,
      name : kakaoUser.name
    });

    // JWT 토큰 생성
    // midleware나 guard에서 토큰이 유효한지 검증
    return {
      accessToken: await this.issueToken(user, false),
      refreshToken: await this.issueToken(user, true),
    };
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
        expiresIn: isRefresh ? '24h' : 10000000,
      },
    );
  }
}
