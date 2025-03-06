import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { Authorization } from './decorator/authorization.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({
    cmd: 'parse_bearer_token',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  parseBearerToken(@Payload() payload: ParseBearerTokenDto) {
    return this.authService.parseBearerToken(payload.token, false);
  }

  // @Post('register')
  // registerUser(
  //   @Authorization() token: string,
  //   @Body() registerDto: RegisterDto,
  // ) {
  //   return this.authService.register(token, registerDto);
  // }

  // @Post('login')
  // loginUser(@Authorization() token: string) {
  //   return this.authService.login(token);
  // }

  @MessagePattern({
    cmd: 'register',
  })
  @UseInterceptors(RpcInterceptor)
  registerUser(@Payload() registerDto: RegisterDto) {
    const { token } = registerDto;

    // if (token === null) {
    //   throw new UnauthorizedException('토큰을 입력해주세요!');
    // }

    return this.authService.register(token, registerDto);
  }

  @MessagePattern({
    cmd: 'login',
  })
  @UseInterceptors(RpcInterceptor)
  loginUser(@Payload() loginDto: LoginDto) {
    const { token } = loginDto;

    // if (token === null) {
    //   throw new UnauthorizedException('토큰을 입력해주세요!');
    // }

    return this.authService.login(token);
  }
}
