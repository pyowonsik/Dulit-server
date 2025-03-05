import { Body, Controller, Post, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { Authorization } from './decorator/authorization.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @MessagePattern({
    cmd : 'parse_bearer_token'
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  parseBearerToken(@Payload() payload : ParseBearerTokenDto){
    // console.log('Request Received');
    return this.authService.parseBearerToken(payload.token,false);
  }


  @Post('register')
  registerUser(
    @Authorization() token: string,
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(token, registerDto);
  }

  @Post('login')
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }
}
