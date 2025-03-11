import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '@app/common';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CommentModel } from './entity/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../post/entity/post.entity';
import { GetCommentDto } from './dto/get-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly dataSource: DataSource, // DataSource 추가
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly paginationService: PaginationService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, postId, comment } = createCommentDto;
      const authorId = meta.user.sub;

      if (!authorId) {
        throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
      }

      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
      }

      const commentModel = queryRunner.manager.create(CommentModel, {
        comment,
        authorId,
        postId,
      });

      await queryRunner.manager.save(commentModel);
      await queryRunner.commitTransaction();

      return commentModel;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateComment(updateCommentDto: UpdateCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, postId, comment, commentId } = updateCommentDto;

      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
      }

      const commentModel = await queryRunner.manager.findOne(CommentModel, {
        where: { id: commentId },
      });

      if (!commentModel) {
        throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
      }

      await queryRunner.manager.update(
        CommentModel,
        { id: commentId },
        { comment },
      );

      const updatedComment = await queryRunner.manager.findOne(CommentModel, {
        where: { id: commentId },
      });

      await queryRunner.commitTransaction();

      return updatedComment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteComment(deleteCommentDto: GetCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { postId, commentId } = deleteCommentDto;

      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
      }

      const comment = await queryRunner.manager.findOne(CommentModel, {
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
      }

      await queryRunner.manager.delete(CommentModel, { id: commentId });

      await queryRunner.commitTransaction();

      return commentId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getComments(getCommentsDto: GetCommentsDto) {
    const { postId } = getCommentsDto;

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

    return qb.getMany();
  }

  async isCommentMineOrAdmin(getCommentDto: GetCommentDto) {
    const { meta, commentId } = getCommentDto;

    return this.commentRepository.exists({
      where: {
        id: commentId,
        authorId: meta.user.sub,
      },
    });
  }
}
