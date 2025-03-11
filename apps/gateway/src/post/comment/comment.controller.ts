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
  UseGuards,
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
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';

@Controller('post/:postId')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/comment')
  async createComment(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createCommentDto: CreateCommentDto,
    @Param('postId') postId: string,
  ) {
    return this.commentService.createComment(
      createCommentDto,
      userPayload,
      postId,
    );
  }

  @Get('/comments')
  async getComments(
    @UserPayload() userPayload: UserPayloadDto,
    @Query() getCommentsDto: GetCommentsDto,
    @Param('postId') postId: string,
  ) {
    return this.commentService.getComments(getCommentsDto, userPayload, postId);
  }

  @Patch('/comment/:commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async updateComment(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updateCommentDto: UpdateCommentDto,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.updateComment(
      updateCommentDto,
      userPayload,
      postId,
      commentId,
    );
  }

  @Delete('/comment/:commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async deleteComment(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.deleteComment(userPayload, postId, commentId);
  }
}
