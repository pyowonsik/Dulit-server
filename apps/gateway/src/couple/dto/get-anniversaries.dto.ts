import { PagePaginationDto, UserPayloadDto } from '@app/common/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetAnniversariesDto extends PagePaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '기념일 제목',
    example: '우리가 사귄날',
  })
  title?: string;
}
