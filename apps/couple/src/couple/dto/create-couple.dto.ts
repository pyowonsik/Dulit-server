import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateCoupleDto {
  @IsString()
  myId: string;

  @IsString()
  partnerId: string;
}
