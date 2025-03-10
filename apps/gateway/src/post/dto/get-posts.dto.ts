import { PaginationService } from '@app/common';
import { CursorPaginationDto } from '@app/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPostsDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '게시글 제목',
    example: '수요일',
  })
  title?: string;
}
