import { COUPLE_SERVICE, POST_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CommentService {
  constructor(
    @Inject(POST_SERVICE)
    private readonly postMicroservice: ClientProxy,
  ) {}

  createComment(
    createCommentDto: CreateCommentDto,
    userPayload: UserPayloadDto,
    postId: string,
  ) {
    return this.postMicroservice.send(
      {
        cmd: 'create_comment',
      },
      {
        postId,
        ...createCommentDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getComments(
    getCommentsDto: GetCommentsDto,
    userPayload: UserPayloadDto,
    postId: string,
  ) {
    return this.postMicroservice.send(
      {
        cmd: 'get_comments',
      },
      {
        postId,
        ...getCommentsDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  updateComment(
    updateCommentDto: UpdateCommentDto,
    userPayload: UserPayloadDto,
    postId: string,
    commentId: string,
  ) {

    return this.postMicroservice.send(
      {
        cmd: 'update_comment',
      },
      {
        ...updateCommentDto,
        postId,
        commentId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  deleteComment(
    userPayload: UserPayloadDto,
    postId: string,
    commentId: string,
  ) {
    return this.postMicroservice.send(
      {
        cmd: 'delete_comment',
      },
      {
        commentId,
        postId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  async isCommentMineOrAdmin(
    userPayload: UserPayloadDto,
    postId: string,
    commentId: string,
  ) {
    // last 없이 찔러보기


    return await lastValueFrom(
      this.postMicroservice.send(
        {
          cmd: 'is_comment_mine_or_admin',
        },
        {
          commentId,
          postId,
          meta: {
            user: userPayload,
          },
        },
      ),
    );
  }
}
