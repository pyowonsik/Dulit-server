import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentModel } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Post } from '../entity/post.entity';
import { Repository } from 'typeorm/repository/Repository';
import { GetCommentDto } from './dto/get-comment.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    private readonly commonService: CommonService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
    postId: number,
  ) {
    // {
    //   post,
    //   author : user,
    //   comment : createCommentDto.comment
    // }

    const author = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });

    if (!author) {
      throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
    }

    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const comment = await this.commentRepository.create({
      comment: createCommentDto.comment,
      author,
      post,
    });
    await this.commentRepository.save(comment);

    const newComment = await this.commentRepository.findOne({
      where: {
        id: comment.id,
      },
    });

    return newComment;
  }

  /* istanbul ignore next */
  async getComments(postId: number) {
    return this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .select();
  }

  async findAll(dto: GetCommentDto, postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const qb = await this.getComments(postId);

    this.commonService.applyPagePaginationParamsToQb(qb, dto);

    const comments = await qb.getMany();

    return comments;
  }

  async findOne(postId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
    }

    return comment;
  }

  // 자기 댓글만 수정가능해야함. 추후 구현
  async update(postId: number, id: number, updateCommentDto: UpdateCommentDto) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },      relations: ['post'],

    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
    }

    await this.commentRepository.update(id, updateCommentDto);

    const newComment = await this.commentRepository.findOne({
      where: {
        id,
      },
    });

    return newComment;
  }

  async remove(postId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },      relations: ['post'],

    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.');
    }

    await this.commentRepository.delete(id);
    return id;
  }

  async isCommentMine(userId: number, commentId: number) {
    return this.commentRepository.exists({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
