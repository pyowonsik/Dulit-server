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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
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
  async findAll() {
    return this.postService.findAll();
  }

  @Get(':postId')
  async findOne(@Param('postId', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':postId')
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
  @UseGuards(IsPostMineOrAdminGuard)
  async remove(@Param('postId', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
