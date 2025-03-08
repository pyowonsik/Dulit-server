import { UserPayloadDto } from '@app/common/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class GetAnniversaryDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsNotEmpty()
  @IsString()
  anniversaryId: string;
}
