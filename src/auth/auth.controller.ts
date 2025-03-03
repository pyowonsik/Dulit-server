import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Post,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register-dto';
import { Authorization } from './decorator/authorization.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiBasicAuth()
  registerUser(
    @Authorization() token: string,
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(token, registerDto);
  }

  @Public()
  @Post('login')
  @ApiBasicAuth()
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }

  // kakao 로그인
  /* istanbul ignore next */
  @Get('kakao')
  @Public()
  @ApiExcludeEndpoint()
  // @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {}

  /* istanbul ignore next */
  @Post('kakao/callback')
  @Public()
  @ApiExcludeEndpoint()
  // @UseGuards(AuthGuard('kakao')) -> redirection 방식일 경우 + GET() 로 카카오 유저 정보 반환
  // 프론트엔드에서 accessToken을 보내줄경우 accessToken으로 getKakaoUserInfo() 조회해서 카카오 유저 정보 반환
  async kakaoLoginCallback(@Body('kakaoAccessToken') kakaoAccessToken: string) {
    return this.authService.kakaoLogin(kakaoAccessToken);
  }

  @Post('token/access')
  @ApiOperation({
    summary: 'access 토큰 재발급',
    description:
      'access 토큰 재발급 - 로그인 정보를 통해 accessToken을 재발급 .',
  })
  async rotateAccessToken(@Request() req: any) {
    // payload(user 정보)를 통해 accessToken 재발급
    // BearerTokenMiddleWear를 통해 req.user를 반환받아 user정보로 payload를 대체하여 issueToken
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  // * 추후 구현 * //
  // // naver 로그인
  // @Get('naver')
  // @Public()
  // @ApiExcludeEndpoint()
  // @UseGuards(AuthGuard('naver'))
  // async naverLogin() {}

  // @Get('naver/callback')
  // @Public()
  // @ApiExcludeEndpoint()
  // @UseGuards(AuthGuard('naver'))
  // async naverAuthCallback(@Request() req) {
  //   return this.authService.naverLogin(req);
  // }
}
