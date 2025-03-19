import { IsEnum, IsString } from 'class-validator';
import { SocialProvider } from '../entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    description: '유저 고유 socialId',
    example: '123456',
  })
  socialId: string;

  @IsString()
  @ApiProperty({
    description: '유저 email',
    example: 'test@test.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: '유저 password',
    example: 'testtest',
  })
  password?: string;

  @IsString()
  @ApiProperty({
    description: '유저 이름',
    example: '홍길동',
  })
  name: string;

  @IsEnum(SocialProvider, {
    message: 'provider must be one of KAKAO, APPLE, NAVER , NORMAL',
  })
  @ApiProperty({
    description: '유저 socialProvider',
    example: 'naver',
  })
  socialProvider: SocialProvider;
}
