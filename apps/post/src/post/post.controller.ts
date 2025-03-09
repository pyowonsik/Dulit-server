import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern({
    cmd: 'create_post',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createPost(@Payload() payload: CreatePostDto) {
    return this.postService.createPost(payload);
  }

  @MessagePattern({
    cmd: 'get_post',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getPost(@Payload() payload: GetPostDto) {
    return this.postService.getPost(payload);
  }

  @MessagePattern({
    cmd: 'get_posts',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getPosts(@Payload() payload: GetPostsDto) {
    return this.postService.getPosts(payload);
  }

  @MessagePattern({
    cmd: 'update_post',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  updatePost(@Payload() payload: UpdatePostDto) {
    return this.postService.updatePost(payload);
  }

  @MessagePattern({
    cmd: 'delete_post',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  deletePost(@Payload() payload: GetPostDto) {
    return this.postService.deletePost(payload);
  }
}
