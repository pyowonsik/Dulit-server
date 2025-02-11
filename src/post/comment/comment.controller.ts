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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('post/:postId/comment')
@ApiTags('comment')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({
    summary: '댓글 작성',
    description: '댓글 작성',
  })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.sub;
    return this.commentService.create(createCommentDto, userId, postId);
  }

  @Get()
  @ApiOperation({
    summary: '댓글 전체 조회',
    description: '댓글 전체 조회',
  })
  findAll(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.findAll(postId);
  }

  @Get(':commentId')
  @ApiOperation({
    summary: '댓글 단건 조회',
    description: '댓글 단건 조회',
  })
  findOne(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  // @Patch(':commentId')
  // @UseGuards(IsPostMineOrAdminGuard)
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateCommentDto: UpdateCommentDto,
  // ) {
  //   return this.commentService.update(id, updateCommentDto);
  // }

  @Delete(':commentId')
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글 삭제',
  })
  @UseGuards(IsCommentMineOrAdminGuard)
  remove(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentService.remove(id);
  }
}
