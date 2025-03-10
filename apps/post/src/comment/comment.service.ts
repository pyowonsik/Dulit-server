import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '@app/common';
import { Repository } from 'typeorm';
import { CommentModel } from './entity/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../post/entity/post.entity';
import { GetCommentDto } from './dto/get-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly paginationService: PaginationService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto) {
    const { meta, postId, comment } = createCommentDto;

    const authorId = meta.user.sub;

    if (!authorId) {
      throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
    }

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const commentModel = this.commentRepository.create({
      comment,
      authorId,
      postId,
    });

    await this.commentRepository.save(commentModel);
    return commentModel;
  }

  async getComments(getCommentsDto: GetCommentsDto) {
    const { meta, postId } = getCommentsDto;

    console.log(getCommentsDto);

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .select();

    this.paginationService.applyPagePaginationParamsToQb(qb, getCommentsDto);

    const comments = await qb.getMany();

    return comments;
  }

  async updateComment(updateCommentDto: UpdateCommentDto) {
    const { meta, postId, comment, commentId } = updateCommentDto;

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const commentModel = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!commentModel) {
      throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
    }

    await this.commentRepository.update(commentId, {
      comment,
    });

    const newCommentModel = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    return newCommentModel;
  }

  async deleteComment(deleteCommentDto: GetCommentDto) {
    const { meta, postId, commentId } = deleteCommentDto;

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
    }

    await this.commentRepository.delete(commentId);
    return commentId;
  }
}
