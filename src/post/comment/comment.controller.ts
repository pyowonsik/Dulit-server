import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';

@Controller('post/:postId/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.sub;
    return this.commentService.create(createCommentDto, userId, postId);
  }

  @Get()
  findAll(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.findAll(postId);
  }

  @Get(':commentId')
  findOne(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  // @Patch(':commentId')
  // @UseGuards(IsPostMineOrAdminGuard)
  // update(
  //   @Param('commentId', ParseIntPipe) id: number,
  //   @Body() updateCommentDto: UpdateCommentDto,
  // ) {
  //   return this.commentService.update(id, updateCommentDto);
  // }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  remove(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentService.remove(id);
  }
}
