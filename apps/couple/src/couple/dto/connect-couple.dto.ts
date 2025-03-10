import { UserPayloadDto } from '@app/common/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ConnectCoupleDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsString()
  partnerId: string;

  @IsBoolean()
  isConnect: boolean;
}
