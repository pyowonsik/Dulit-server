import {
  CursorPaginationDto,
  PagePaginationDto,
  UserPayloadDto,
} from '@app/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetPostsDto extends CursorPaginationDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '게시글 제목',
    example: '수요일',
  })
  title?: string;
}
