import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class ConnectCoupleDto {
  @IsString()
  partnerId : string;

  @IsBoolean()
  isConnect : boolean;
}
