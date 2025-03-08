import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PagePaginationDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : value))
  @ApiProperty({
    description: '페이지 번호',
    example: '1',
  })
  page: number = 1;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : value))
  @ApiProperty({
    description: '가져올 데이터의 개수',
    example: '5',
  })
  take: number = 5;
}
