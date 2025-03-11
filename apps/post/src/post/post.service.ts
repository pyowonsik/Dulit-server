import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './entity/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { GetPostDto } from './dto/get-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationService } from '@app/common';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { rename } from 'fs/promises';
import { CommentModel } from '../comment/entity/comment.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly dataSource: DataSource, // DataSource 추가
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly paginationService: PaginationService,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, title, description, filePaths } = createPostDto;
      const userId = meta.user.sub;

      if (filePaths) {
        const tempFolder = join('public', 'temp');
        const filesFolder = join('public', 'files/post');

        if (!existsSync(filesFolder)) {
          mkdirSync(filesFolder, { recursive: true });
        }

        await Promise.all(
          filePaths.map(async (file) =>
            this.renameFiles(tempFolder, filesFolder, file),
          ),
        );
      }

      const post = queryRunner.manager.create(Post, {
        title,
        description,
        filePaths,
        authorId: userId,
      });

      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();

      return post;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePost(updatePostDto: UpdatePostDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, title, description, filePaths, postId } = updatePostDto;

      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
      }

      if (filePaths) {
        const tempFolder = join('public', 'temp');
        const filesFolder = join('public', 'files/post');

        filePaths.forEach((file) => {
          const filePath = join(filesFolder, file);
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        });

        await Promise.all(
          filePaths.map(async (file) =>
            this.renameFiles(tempFolder, filesFolder, file),
          ),
        );
      }

      await queryRunner.manager.update(
        Post,
        { id: postId },
        {
          title,
          description,
          filePaths,
          authorId: meta.user.sub,
        },
      );

      const updatedPost = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      await queryRunner.commitTransaction();

      return updatedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deletePost(getPostDto: GetPostDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { postId } = getPostDto;

      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
      }

      await queryRunner.manager.delete(CommentModel, { postId });
      await queryRunner.manager.delete(Post, { id: postId });

      await queryRunner.commitTransaction();

      return postId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPosts(getPostsDto: GetPostsDto) {
    const { title } = getPostsDto;

    const qb = this.postRepository.createQueryBuilder('post').select();

    if (title) {
      qb.where('post.title LIKE :title', { title: `%${title}%` });
    }

    const { nextCursor } =
      await this.paginationService.applyCursorPaginationParamsToQb(
        qb,
        getPostsDto,
      );

    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      nextCursor,
      count,
    };
  }

  async getPost(getPostDto: GetPostDto) {
    const { postId } = getPostDto;

    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    return post;
  }

  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    return rename(
      join(process.cwd(), tempFolder, file),
      join(process.cwd(), filesFolder, file),
    );
  }

  async isPostMineOrAdmin(getPostDto: GetPostDto) {
    const { meta, postId } = getPostDto;

    return this.postRepository.exists({
      where: {
        id: postId,
        authorId: meta.user.sub,
      },
    });
  }
}
