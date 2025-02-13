import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Post,
  Req,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // kakao 로그인
  @Get('kakao')
  @Public()
  @ApiExcludeEndpoint() // Swagger에서 이 엔드포인트 숨김
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {}

  @Get('kakao/callback')
  @Public()
  @ApiExcludeEndpoint() // Swagger에서 이 엔드포인트 숨김
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Request() req) {
    return this.authService.kakaoLogin(req);
  }

  // naver 로그인
  @Get('naver')
  @Public()
  @ApiExcludeEndpoint() // Swagger에서 이 엔드포인트 숨김
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {}

  @Get('naver/callback')
  @Public()
  @ApiExcludeEndpoint() // Swagger에서 이 엔드포인트 숨김
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Request() req) {
    return this.authService.naverLogin(req);
  }

  @Post('token/access')
  @ApiOperation({
    summary: 'access 토큰 재발급',
    description: 'access 토큰 재발급',
  })
  async rotateAccessToken(@Request() req: any) {
    // payload(user 정보)를 통해 accessToken 재발급
    // BearerTokenMiddleWear를 통해 req.user를 반환받아 user정보로 payload를 대체하여 issueToken
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }
  
  // socialId 로그인 후, postMan env accessToken에 넣기
  // -> social login을 직접 호출할수 없어서 생성한 test endpoint
  @Post('social/login/:socialId')
  @ApiOperation({
    summary: 'access 토큰 발급을 위한 socialId로 로그인',
    description: 'access 토큰 발급을 위한 socialId로 로그인',
  })
  @ApiBasicAuth()
  @Public()
  async socialIdLogin(@Param('socialId') socialId: string) {
    return this.authService.socialIdLogin(socialId);
  }
}
