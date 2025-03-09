import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { UserPayloadDto } from '@app/common/dto';

import { FilesInterceptor } from '@nestjs/platform-express';
import { CommentService } from './comment.service';
import { UserPayload } from '../../auth/decorator/user-payload.decorator';
import { GetCommentsDto } from './dto/get-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/comment')
  async createComment(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(createCommentDto, userPayload);
  }

  @Get('/comments')
  async getComments(
    @UserPayload() userPayload: UserPayloadDto,
    @Query() getCommentsDto: GetCommentsDto,
  ) {
    return this.commentService.getComments(getCommentsDto, userPayload);
  }

  // @Get('/comment/:commentId')
  // async getComment(
  //   @UserPayload() userPayload: UserPayloadDto,
  //   @Param('commentId') commentId: string,
  // ) {
  //   return this.commentService.getComment(userPayload, commentId);
  // }

  @Patch('/comment/:commentId')
  async updateComment(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updateCommentDto: UpdateCommentDto,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.updateComment(
      updateCommentDto,
      userPayload,
      commentId,
    );
  }

  @Delete('/comment/:commentId')
  async deleteComment(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.deleteComment(userPayload, commentId);
  }
}
