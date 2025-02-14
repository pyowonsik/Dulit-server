import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';
import { UserId } from 'src/user/decorator/user-id.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Plan } from 'src/plan/entities/plan.entity';
import { GetPostDto } from './dto/get-post-dto';

@Controller('post')
@ApiTags('post')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({
    summary: '게시글 작성',
    description: '게시글 작성',
  })
  @UseInterceptors(TransactionInterceptor)
  async create(
    @Request() req: any,
    @Body() createPostDto: CreatePostDto,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    const userId = req.user.sub;
    return this.postService.create(userId, createPostDto, qr);
  }

  @Get()
  @ApiOperation({
    summary: '게시글 전체 조회',
    description: '게시글 전체 조회',
  })
  async findAll(@Query() dto: GetPostDto) {
    return this.postService.findAll(dto);
  }

  @Get(':postId')
  @ApiOperation({
    summary: '게시글 단건 조회',
    description: '게시글 단건 조회',
  })
  async findOne(@Param('postId', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':postId')
  @ApiOperation({
    summary: '게시글 수정',
    description: '게시글 수정',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsPostMineOrAdminGuard)
  async update(
    @Param('postId', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @QueryRunner() qr: QR,
  ) {
    return this.postService.update(id, updatePostDto, qr);
  }

  @Delete(':postId')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글 삭제',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsPostMineOrAdminGuard)
  async remove(
    @Param('postId', ParseIntPipe) id: number,
    @QueryRunner() qr: QR,
  ) {
    return this.postService.remove(id,qr);
  }

  @Post(':postId/like')
  @ApiOperation({
    summary: '게시글 좋아요',
    description: '게시글 좋아요',
  })
  @UseInterceptors(TransactionInterceptor)
  createPostLike(
    @Param('postId', ParseIntPipe) postId: number,
    @UserId() userId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.postService.togglePostLike(postId, userId, true,qr);
  }

  @Post(':postId/dislike')
  @ApiOperation({
    summary: '게시글 싫어요',
    description: '게시글 싫어요',
  })
  @UseInterceptors(TransactionInterceptor)
  createPostDisLike(
    @Param('postId', ParseIntPipe) postId: number,
    @UserId() userId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.postService.togglePostLike(postId, userId, false,qr);
  }
}
