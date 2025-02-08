import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Post,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // kakao 로그인
  @Get('kakao')
  @Public()
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {}

  @Get('kakao/callback')
  @Public()
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Request() req) {
    return this.authService.kakaoLogin(req);
  }

  // naver 로그인
  @Get('naver')
  @Public()
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {}

  @Get('naver/callback')
  @Public()
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Request() req) {
    return this.authService.naverLogin(req);
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req: any) {
    // payload(user 정보)를 통해 accessToken 재발급
    // BearerTokenMiddleWear를 통해 req.user를 반환받아 user정보로 payload를 대체하여 issueToken
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Get('/me')
  // @Public()
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.sub);
  }
}
