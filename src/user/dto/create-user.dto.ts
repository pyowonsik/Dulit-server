import { IsEmail, IsEnum, IsString } from 'class-validator';
import { SocialProvider } from '../entity/user.entity';

export class CreateUserDto {
  @IsString()
  socialId: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsEnum(SocialProvider, {
    message: 'provider must be one of KAKAO, APPLE, NAVER',
  })
  socialProvider: SocialProvider;
}
