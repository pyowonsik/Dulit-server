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
import { Couple } from 'src/user/entity/couple.entity';
import { Post } from './entities/post.entity';
import { join } from 'path';
import { rename } from 'fs/promises';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
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

    // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
    const tempFolder = join('public', 'temp');
    const filesFolder = join('public', 'files');

    if (!existsSync(filesFolder)) {
      mkdirSync(filesFolder, { recursive: true });
    }

    if (!createPostDto.filePaths || createPostDto.filePaths.length === 0) {
      throw new BadRequestException('이동할 파일이 없습니다.');
    }

    try {
      await Promise.all(
        createPostDto.filePaths.map(async (file) => {
          await rename(
            join(process.cwd(), tempFolder, file),
            join(process.cwd(), filesFolder, file),
          );
        }),
      );
    } catch (error) {
      console.error('파일 이동 중 오류 발생:', error);
      throw new InternalServerErrorException('파일 이동에 실패했습니다.');
    }

    const post = qr.manager.create(Post, {
      ...createPostDto,
      author,
      couple,
    });

    await qr.manager.save(Post, post);

    // 현재 posts 조회해야됨.
    return await qr.manager.find(Post);
  }

  async findAll() {
    const posts = await this.postRepository.find();
    return posts;
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
    // 수정 기능 .
    // author가 현재 post의 author일 경우 .
    // title , description , filePaths

    const post = await qr.manager.findOne(Post, {
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
    const tempFolder = join('public', 'temp');
    const filesFolder = join('public', 'files');

    // 1. public/files의 post.filePaths 삭제
    post.filePaths.forEach((file) => {
      const filePath = join(filesFolder, file);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    });

    // 2. 파일 이동 (병렬 처리)
    await Promise.all(
      updatePostDto.filePaths.map(
        async (file) =>
          await rename(
            join(process.cwd(), tempFolder, file),
            join(process.cwd(), filesFolder, file),
          ),
      ),
    );

    // 3. post의 filePaths 수정
    await qr.manager.update(
      Post,
      { id },
      { ...updatePostDto, filePaths: updatePostDto.filePaths },
    );

    const newPost = await qr.manager.findOne(Post, { where: { id } });

    return newPost;
  }

  async remove(id: number) {
    // post 내부에 중첩된 삭제해야할 내용이 없으므로 post만 삭제하면됨.
    const post = await this.postRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('존재하지 않는 POST의 ID 입니다.');
    }

    await this.postRepository.delete(post.id);

    return id;
  }
}
