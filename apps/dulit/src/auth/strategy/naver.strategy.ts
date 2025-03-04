import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { _json } = profile;

    const info = {
      socialId: _json.id,
      email: _json.email,
      name: _json.nickname,
      // gender: _json.kakao_account.gender,
    };

    // const { id, displayName, emails, _json } = profile;
    // const user = {
    //   id,
    //   username: displayName,
    //   email: emails[0].value,
    //   profile: _json,
    // };
    // done(null, user);

    return {
      accessToken,
      refreshToken,
      info,
    };
  }
}
