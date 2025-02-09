import { PickType } from '@nestjs/mapped-types';
import { CommentModel } from '../entity/comment.entity';
import { IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  comment?: string;
}
