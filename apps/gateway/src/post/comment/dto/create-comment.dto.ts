import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '댓글 내용',
    example: '좋은 정보 감사요~~',
  })
  comment?: string;
}
