import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  registerUser(
    @Authorization() token: string,
    @Body() registerDto: RegisterDto,
  ) {
    // if (token === null || token === undefined) {
    //   throw new UnauthorizedException('토큰을 입력해주세요!');
    // }

    return this.authService.register(token, registerDto);
  }

  @Post('login')
  @Public()
  loginUser(@Authorization() token: string) {
    // if (token === null || token === undefined) {
    //   throw new UnauthorizedException('토큰을 입력해주세요!');
    // }
    return this.authService.login(token);
  }
}
