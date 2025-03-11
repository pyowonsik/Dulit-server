import { COUPLE_SERVICE, POST_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PostService {
  constructor(
    @Inject(POST_SERVICE)
    private readonly postMicroservice: ClientProxy,
  ) {}

  createPost(createPostDto: CreatePostDto, userPayload: UserPayloadDto) {
    return this.postMicroservice.send(
      {
        cmd: 'create_post',
      },
      {
        ...createPostDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getPosts(getPostsDto: GetPostsDto, userPayload: UserPayloadDto) {
    return this.postMicroservice.send(
      {
        cmd: 'get_posts',
      },
      {
        ...getPostsDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getPost(userPayload: UserPayloadDto, postId: string) {
    return this.postMicroservice.send(
      {
        cmd: 'get_post',
      },
      {
        // ...getPostDto,
        postId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  updatePost(
    updatePostDto: UpdatePostDto,
    userPayload: UserPayloadDto,
    postId: string,
  ) {
    return this.postMicroservice.send(
      {
        cmd: 'update_post',
      },
      {
        ...updatePostDto,
        postId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  deletePost(userPayload: UserPayloadDto, postId: string) {
    return this.postMicroservice.send(
      {
        cmd: 'delete_post',
      },
      {
        postId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  async isPostMineOrAdmin(userPayload: UserPayloadDto, postId: string) {
    return await lastValueFrom(
      this.postMicroservice.send(
        {
          cmd: 'is_post_mine_or_admin',
        },
        {
          postId,
          meta: {
            user: userPayload,
          },
        },
      ),
    );
  }
}
