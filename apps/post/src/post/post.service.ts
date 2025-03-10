import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './entity/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { GetPostDto } from './dto/get-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ClientProxy } from '@nestjs/microservices';
import { PaginationService, USER_SERVICE } from '@app/common';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { rename } from 'fs/promises';
import { lastValueFrom } from 'rxjs';
import { CommentModel } from '../comment/entity/comment.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(CommentModel)
    private readonly commentRepository: Repository<CommentModel>,
    private readonly paginationService: PaginationService,
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const { meta, title, description, filePaths } = createPostDto;
    const userId = meta.user.sub;

    // const user = await lastValueFrom(
    //   this.userMicroservice.send({ cmd: 'get_user_info' }, { userId }),
    // );

    // console.log(user);

    // if (!user.coupleId) {
    //   throw new NotFoundException('커플 관계가 존재하지 않습니다.');
    // }

    // 커플 확인
    if (filePaths) {
      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/post');

      if (!existsSync(filesFolder)) {
        mkdirSync(filesFolder, { recursive: true });
      }

      if (!filePaths || filePaths.length === 0) {
        throw new BadRequestException('이동할 파일이 없습니다.');
      }

      try {
        await Promise.all(
          filePaths.map(async (file) => {
            await this.renameFiles(tempFolder, filesFolder, file);
          }),
        );
      } catch (error) {
        // console.error('파일 이동 중 오류 발생:', error);
        throw new InternalServerErrorException('파일 이동에 실패했습니다.');
      }
    }

    const post = this.postRepository.create({
      title,
      description,
      filePaths,
      authorId: userId,
    });

    this.postRepository.save(post);

    return post;
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

    let [data, count] = await qb.getManyAndCount();

    // 기존 반환값에 cursor를 넣어줌
    return {
      data,
      nextCursor,
      count,
    };
  }

  async getPost(getPostDto: GetPostDto) {
    const { meta, postId } = getPostDto;

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

  async updatePost(updatePostDto: UpdatePostDto) {
    const { meta, title, description, filePaths, postId } = updatePostDto;

    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }
    if (filePaths) {
      if (!filePaths) {
        throw new BadRequestException('파일 선업로드 후 요청해주세요.');
      }

      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/post');

      // 1. public/files의 post.filePaths 삭제
      filePaths.forEach((file) => {
        const filePath = join(filesFolder, file);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });

      // 2. 파일 이동 (병렬 처리)
      await Promise.all(
        filePaths.map(
          async (file) => await this.renameFiles(tempFolder, filesFolder, file),
        ),
      );
    }

    await this.postRepository.update(
      { id: postId },
      {
        title,
        description,
        filePaths,
        authorId: meta.user.sub,
      },
    );

    const newPost = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    return newPost;
  }

  async deletePost(getPostDto: GetPostDto) {
    const { meta, postId } = getPostDto;

    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    await this.commentRepository.delete({
      postId,
    });

    await this.postRepository.delete({
      id: postId,
    });

    return postId;
  }

  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    return await rename(
      join(process.cwd(), tempFolder, file),
      join(process.cwd(), filesFolder, file),
    );
  }
}
