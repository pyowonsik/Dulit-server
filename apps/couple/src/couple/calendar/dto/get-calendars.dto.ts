import { PagePaginationDto, UserPayloadDto } from '@app/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetCalendarsDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: '검색 월',
    example: '3',
  })
  month?: number;
}
