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
import { PostService } from './post.service';

import { FilesInterceptor } from '@nestjs/platform-express';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserPayload } from '../auth/decorator/user-payload.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';

@Controller('')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/post')
  async createPost(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.createPost(createPostDto, userPayload);
  }

  @Get('/posts')
  async getPosts(
    @UserPayload() userPayload: UserPayloadDto,
    @Query() getPostsDto: GetPostsDto,
  ) {
    return this.postService.getPosts(getPostsDto, userPayload);
  }

  @Get('/post/:postId')
  async getPost(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('postId') postId: string,
  ) {
    return this.postService.getPost(userPayload, postId);
  }

  @Patch('/post/:postId')
  @UseGuards(IsPostMineOrAdminGuard)
  async updatePost(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updatePostDto: UpdatePostDto,
    @Param('postId') postId: string,
  ) {
    return this.postService.updatePost(updatePostDto, userPayload, postId);
  }

  @Delete('/post/:postId')
  @UseGuards(IsPostMineOrAdminGuard)
  async deletePost(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('postId') postId: string,
  ) {
    return this.postService.deletePost(userPayload, postId);
  }

  @Post('/post/upload/files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // 파일 사이즈 제한
      limits: {
        fileSize: 20000000,
      },
      fileFilter(req, file, callback) {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/mpeg',
          'video/webm',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              '이미지 또는 영상 파일만 업로드 가능합니다.',
            ),
            false,
          );
        }
        return callback(null, true);
      },
    }),
  )
  async createFiles(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const fileNames = files.map((file) => file.filename);

    return {
      fileNames: fileNames,
    };
  }
}
