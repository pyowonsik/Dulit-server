import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 이름',
    example: '홍길동',
  })
  name: string;
}
