import { PickType } from '@nestjs/mapped-types';
import { CommentModel } from '../entity/comment.entity';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '댓글 내용',
    example: '좋은 정보 감사요~~',
  })
  comment?: string;
}
