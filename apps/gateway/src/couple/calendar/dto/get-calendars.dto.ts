import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetCalendarsDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: '검색 월',
    example: '3',
  })
  @Transform(({ value }) => (value ? parseInt(value, 10) : value))
  month?: number;
}
