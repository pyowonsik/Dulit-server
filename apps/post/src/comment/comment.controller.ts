import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { UpdateCommentDto } from 'apps/dulit/src/post/comment/dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsDto } from 'apps/gateway/src/post/comment/dto/get-comments.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern({
    cmd: 'create_comment',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createComment(@Payload() payload: CreateCommentDto) {
    // return this.commentService.createComment(payload);
  }

  // @MessagePattern({
  //   cmd: 'get_comment',
  // })
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  // getComment(@Payload() payload: GetCommentDto) {
  //   // return this.commentService.getComment(payload);
  // }

  @MessagePattern({
    cmd: 'get_comments',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getComments(@Payload() payload: GetCommentsDto) {
    // return this.commentService.getComments(payload);
  }

  @MessagePattern({
    cmd: 'update_comment',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  updateComment(@Payload() payload: UpdateCommentDto) {
    // return this.commentService.updateComment(payload);
  }

  // @MessagePattern({
  //   cmd: 'delete_post',
  // })
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  // deleteComment(@Payload() payload: GetCommentDto) {
  //   return this.commentService.deleteComment(payload);
  // }
}
