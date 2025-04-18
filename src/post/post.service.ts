import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Post } from './entity/post.entity';
import { join } from 'path';
import { rename } from 'fs/promises';
import { existsSync, unlinkSync } from 'fs';
import { CommentModel } from './comment/entity/comment.entity';
import { console } from 'inspector';
import { PostUserLike } from './comment/entity/post-user-like.entity';
import { GetPostDto } from './dto/get-post-dto';
import { CommonService } from 'src/common/common.service';
import { Couple } from 'src/couple/entity/couple.entity';
import { PostResponseDto } from './dto/post-response.dto';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  async create(id: number, createPostDto: CreatePostDto, qr: QueryRunner) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: { id: In([id]) },
      },
      relations: ['users', 'posts'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const author = await qr.manager.findOne(User, { where: { id } });

    if (!author) {
      throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
    }

    if (createPostDto.filePaths) {
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/post');

      // if (!existsSync(filesFolder)) {
      //   mkdirSync(filesFolder, { recursive: true });
      // }

      if (!createPostDto.filePaths || createPostDto.filePaths.length === 0) {
        throw new BadRequestException('이동할 파일이 없습니다.');
      }

      try {
        await Promise.all(
          createPostDto.filePaths.map(async (file) => {
            await this.renameFiles(tempFolder, filesFolder, file);
          }),
        );
      } catch (error) {
        console.error('파일 이동 중 오류 발생:', error);
        throw new InternalServerErrorException('파일 이동에 실패했습니다.');
      }
    }

    const post = await qr.manager.create(Post, {
      ...createPostDto,
      author,
      couple,
    });

    const savedPost = await qr.manager.save(Post, post);
    return new PostResponseDto(savedPost);
  }

  async findAll(dto: GetPostDto) {
    const { title } = dto;

    const qb = await this.getPosts();

    if (title) {
      qb.where('post.title LIKE :title', { title: `%${title}%` });
    }

    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const [data, count] = await qb.getManyAndCount();

    // 기존 반환값에 cursor를 넣어줌
    return {
      data,
      nextCursor,
      count,
    };
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, qr: QueryRunner) {
    const post = await qr.manager.findOne(Post, {
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    if (updatePostDto.filePaths) {
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/post');

      // 1. delete local 기존 파일
      if (post.filePaths?.length)
        await this.deleteOldFiles(post.filePaths, filesFolder);

      // 2. 파일 이동 (병렬 처리)
      try {
        await Promise.all(
          updatePostDto.filePaths.map(
            async (file) =>
              await this.renameFiles(tempFolder, filesFolder, file),
          ),
        );
      } catch (err) {
        /* istanbul ignore next */
        if (err.code === 'ENOENT') {
          throw new BadRequestException(
            '파일 이동에 실패했습니다. 파일 경로를 확인해주세요.',
          );
        }
        /* istanbul ignore next */
        throw err;
      }
    }

    // 3. post의 filePaths 수정
    await qr.manager.update(
      Post,
      { id },
      { ...updatePostDto, filePaths: updatePostDto.filePaths },
    );

    const newPost = await qr.manager.findOne(Post, { where: { id } });

    return new PostResponseDto(newPost);
  }

  async remove(id: number, qr: QueryRunner) {
    const post = await qr.manager.findOne(Post, {
      where: {
        id,
      },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    await qr.manager.delete(CommentModel, {
      post,
    });

    await qr.manager.delete(Post, post.id);

    return id;
  }

  async isPostMine(userId: number, postId: number) {
    return this.postRepository.exists({
      where: {
        id: postId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }

  async togglePostLike(
    postId: number,
    userId: number,
    isLike: boolean,
    qr: QueryRunner,
  ) {
    const post = await qr.manager.findOne(Post, {
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    const user = await qr.manager.findOne(User, {
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
    }

    const likeRecord = await this.getLikedRecord(postId, userId, qr);

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        // 좋아요에서 좋아요 누르면 삭제
        await qr.manager.delete(PostUserLike, { post, user });
      } else {
        // 좋아요에서 싫어요 누르면 해당 post,user 싫어요
        await qr.manager.update(
          PostUserLike,
          {
            post,
            user,
          },
          { isLike },
        );
      }
    } else {
      // likeRecord 없다면 해당 movie,user의 postUserLike 좋아요
      await qr.manager.save(PostUserLike, {
        post,
        user,
        isLike,
      });
    }

    const result = await this.getLikedRecord(postId, userId, qr);

    return {
      isLike: result && result.isLike,
    };
  }

  /* istanbul ignore next */
  async deleteOldFiles(filePaths: string[], filesFolder: string) {
    if (this.configService.get<string>(envVariableKeys.env) !== 'prod') {
      filePaths.forEach((file) => {
        const filePath = join(filesFolder, file);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });
    } else {
      return filePaths.forEach((file) => {
        this.commonService.deleteOldFilesFromStorage(file, 'post');
      });
    }
  }

  /* istanbul ignore next */
  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    if (this.configService.get<string>(envVariableKeys.env) !== 'prod') {
      return await rename(
        join(process.cwd(), tempFolder, file),
        join(process.cwd(), filesFolder, file),
      );
    } else {
      return this.commonService.saveMovieToPermanentStorage(file, 'post');
    }
  }

  /* istanbul ignore next */
  async getPosts() {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments');
  }

  /* istanbul ignore next */
  async getLikedRecord(postId: number, userId: number, qr: QueryRunner) {
    return await qr.manager
      .createQueryBuilder(PostUserLike, 'pul')
      .leftJoinAndSelect('pul.post', 'post')
      .leftJoinAndSelect('pul.user', 'user')
      .where('post.id = :postId', { postId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }
}
