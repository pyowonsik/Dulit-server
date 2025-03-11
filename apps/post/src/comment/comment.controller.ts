import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentDto } from './dto/get-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern({
    cmd: 'create_comment',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createComment(@Payload() payload: CreateCommentDto) {
    return this.commentService.createComment(payload);
  }

  @MessagePattern({
    cmd: 'get_comments',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getComments(@Payload() payload: GetCommentsDto) {
    return this.commentService.getComments(payload);
  }

  @MessagePattern({
    cmd: 'update_comment',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  updateComment(@Payload() payload: UpdateCommentDto) {

    return this.commentService.updateComment(payload);
  }

  @MessagePattern({
    cmd: 'delete_comment',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  deleteComment(@Payload() payload: GetCommentDto) {
    return this.commentService.deleteComment(payload);
  }

  @MessagePattern({
    cmd: 'is_comment_mine_or_admin',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  isCommentMineOrAdmin(@Payload() payload: GetCommentDto) {
    return this.commentService.isCommentMineOrAdmin(payload);
  }
}
