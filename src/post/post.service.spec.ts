/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Post } from './entity/post.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommentModel } from './comment/entity/comment.entity';
import { Couple } from 'src/couple/entity/couple.entity';
import { User } from 'src/user/entity/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { GetPostDto } from './dto/get-post-dto';
import { PostUserLike } from './comment/entity/post-user-like.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

const mockPostRepository = {
  findOne: jest.fn(),
  exists: jest.fn(),
};

const mockCommonService = {
  applyCursorPaginationParamsToQb: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};
describe('PostService', () => {
  let postService: PostService;
  let commonService: CommonService;
  let postRepository: Repository<Post>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,

        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    commonService = module.get<CommonService>(CommonService);
    configService = module.get<ConfigService>(ConfigService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  describe('create', () => {
    let qr: jest.Mocked<QueryRunner>;
    let renameFiles: jest.SpyInstance;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;

      renameFiles = jest.spyOn(postService, 'renameFiles');
    });

    it('should create a post successfully', async () => {
      const userId = 1;
      const couple = { id: 1, posts: [] } as Couple;
      const author = { id: 1 } as User;
      const createPostDto: CreatePostDto = {
        title: '',
        description: '',
        filePaths: ['temp/file1.png'],
      };
      const postResponseDto: PostResponseDto = {
        id: 0,
        title: '',
        description: '',
        filePaths: ['files/post/file1.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(author);
      (qr.manager.create as jest.Mock).mockReturnValue(postResponseDto);
      (qr.manager.save as jest.Mock).mockResolvedValue(postResponseDto);
      renameFiles.mockResolvedValue(undefined);

      const result = await postService.create(userId, createPostDto, qr);

      expect(qr.manager.findOne).toHaveBeenNthCalledWith(1, Couple, {
        where: {
          users: {
            id: In([userId]),
          },
        },
        relations: ['users', 'posts'],
      });

      expect(qr.manager.findOne).toHaveBeenNthCalledWith(2, User, {
        where: { id: userId },
      });

      expect(result).toEqual(postResponseDto);
      expect(qr.manager.create).toHaveBeenCalledWith(Post, {
        ...createPostDto,
        author,
        couple,
      });
      expect(qr.manager.save).toHaveBeenCalledWith(Post, result);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const createPostDto: CreatePostDto = {
        title: '',
        description: '',
        filePaths: [],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        postService.create(userId, createPostDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if author does not exist', async () => {
      const userId = 1;
      const couple = { id: 1, posts: [] } as Couple;
      const createPostDto: CreatePostDto = {
        title: '',
        description: '',
        filePaths: [],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        postService.create(userId, createPostDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should move files if filePaths are provided', async () => {
      const userId = 1;
      const couple = { id: 1, posts: [] } as Couple;
      const author = { id: 1 } as User;
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        description: 'Test Content',
        filePaths: ['temp/file1.png', 'temp/file2.png'],
      };
      const postResponseDto: PostResponseDto = {
        id: 1,
        title: 'Test Post',
        description: 'Test Content',
        filePaths: ['files/post/file1.png', 'files/post/file2.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(author);
      (qr.manager.create as jest.Mock).mockReturnValue(postResponseDto);
      (qr.manager.save as jest.Mock).mockResolvedValue(postResponseDto);
      renameFiles.mockResolvedValue(undefined);

      const result = await postService.create(userId, createPostDto, qr);

      expect(renameFiles).toHaveBeenCalledTimes(2);
      expect(renameFiles).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
      expect(renameFiles).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual(postResponseDto);
    });

    it('should throw InternalServerErrorException if file renaming fails', async () => {
      const userId = 1;
      const couple = { id: 1, posts: [] } as Couple;
      const author = { id: 1 } as User;
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        description: 'Test Content',
        filePaths: ['temp/file1.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(author);
      renameFiles.mockRejectedValue(new Error('File rename error'));

      await expect(
        postService.create(userId, createPostDto, qr),
      ).rejects.toThrow(InternalServerErrorException);

      expect(renameFiles).toHaveBeenCalledTimes(1);
      expect(renameFiles).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should throw BadRequestException if filePaths are empty', async () => {
      const userId = 1;
      const couple = { id: 1, posts: [] } as Couple;
      const author = { id: 1 } as User;
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        description: 'Test Content',
        filePaths: [],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(author);

      await expect(
        postService.create(userId, createPostDto, qr),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    let getPostsMock: jest.SpyInstance;
    let applyCursorPaginationMock: jest.SpyInstance;
    let qb: any;

    beforeEach(() => {
      getPostsMock = jest.spyOn(postService, 'getPosts');
      applyCursorPaginationMock = jest.spyOn(
        commonService,
        'applyCursorPaginationParamsToQb',
      );

      qb = {
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
    });

    it('should return all posts successfully without filter', async () => {
      const getPostDto: GetPostDto = {
        order: [],
        take: 0,
      };
      const posts = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ];
      const nextCursor = 'next-cursor';

      getPostsMock.mockResolvedValue(qb);
      applyCursorPaginationMock.mockResolvedValue({ nextCursor });
      qb.getManyAndCount.mockResolvedValue([posts, posts.length]);

      const result = await postService.findAll(getPostDto);

      expect(getPostsMock).toHaveBeenCalled();
      expect(qb.where).not.toHaveBeenCalled();
      expect(applyCursorPaginationMock).toHaveBeenCalledWith(qb, getPostDto);
      expect(qb.getManyAndCount).toHaveBeenCalled();

      expect(result).toEqual({
        data: posts,
        nextCursor,
        count: posts.length,
      });
    });

    it('should return filtered posts by title', async () => {
      const getPostDto: GetPostDto = {
        title: 'Post',
        order: [],
        take: 0,
      };
      const posts = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ];
      const nextCursor = 'next-cursor';

      getPostsMock.mockResolvedValue(qb);
      applyCursorPaginationMock.mockResolvedValue({ nextCursor });
      qb.getManyAndCount.mockResolvedValue([posts, posts.length]);

      const result = await postService.findAll(getPostDto);

      expect(getPostsMock).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith('post.title LIKE :title', {
        title: '%Post%',
      });
      expect(applyCursorPaginationMock).toHaveBeenCalledWith(qb, getPostDto);
      expect(qb.getManyAndCount).toHaveBeenCalled();

      expect(result).toEqual({
        data: posts,
        nextCursor,
        count: posts.length,
      });
    });
  });

  describe('findOne', () => {
    it('should return post if found', async () => {
      const id = 1;
      const post = { id, title: 'Test Post' };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(post as Post);

      const result = await postService.findOne(id);

      expect(result).toEqual(post);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      const id = 1;

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(postService.findOne(id)).rejects.toThrow(NotFoundException);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('update', () => {
    let qr: jest.Mocked<QueryRunner>;
    let renameFilesSpy: jest.SpyInstance;
    let existsSyncSpy: jest.SpyInstance;
    let unlinkSyncSpy: jest.SpyInstance;

    beforeEach(async () => {
      qr = {
        manager: {
          findOne: jest.fn().mockResolvedValue({
            id: 1,
            filePaths: ['old-file.png'],
            title: '',
            description: '',
          }),
          update: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;

      renameFilesSpy = jest
        .spyOn(postService, 'renameFiles')
        .mockResolvedValue(undefined);
      existsSyncSpy = jest.spyOn(fs, 'existsSync');
      unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync');
    });

    it('should update a post successfully', async () => {
      const postId = 1;
      const post = {
        id: 1,
        filePaths: ['old-file.png'],
        title: '',
        description: '',
      } as Post;
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        filePaths: ['temp/new-file.png'],
      };
      const updatedPost = new PostResponseDto(post);

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(post);
      existsSyncSpy.mockReturnValue(true);
      unlinkSyncSpy.mockImplementation(() => {});
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(updatedPost);

      const result = await postService.update(postId, updatePostDto, qr);

      expect(qr.manager.findOne).toHaveBeenCalledWith(Post, {
        where: { id: postId },
      });
      expect(unlinkSyncSpy).toHaveBeenCalledWith(expect.any(String));
      expect(renameFilesSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
      expect(qr.manager.update).toHaveBeenCalledWith(
        Post,
        { id: postId },
        { ...updatePostDto },
      );
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const postId = 1;
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        postService.update(postId, updatePostDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete existing files before renaming new ones', async () => {
      const postId = 1;
      const post = {
        id: 1,
        title: '',
        description: '',
        filePaths: ['old-file1.png', 'old-file2.png'],
      } as Post;
      const updatePostDto: UpdatePostDto = { filePaths: ['temp/new-file.png'] };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(post);
      existsSyncSpy.mockReturnValue(true);
      unlinkSyncSpy.mockImplementation(() => {});
      renameFilesSpy.mockResolvedValue(undefined);

      await postService.update(postId, updatePostDto, qr);

      expect(unlinkSyncSpy).toHaveBeenCalledWith(expect.any(String));
      expect(unlinkSyncSpy).toHaveBeenCalledWith(expect.any(String));
      expect(renameFilesSpy).toHaveBeenCalledWith(
        expect.any(String),

        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('remove', () => {
    let qr: jest.Mocked<QueryRunner>;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          delete: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
    });

    it('should delete post and its comments if found', async () => {
      const id = 1;
      const post = { id, comments: [] };

      jest.spyOn(qr.manager, 'findOne').mockResolvedValue(post);

      const result = await postService.remove(id, qr);

      expect(result).toBe(id);
      expect(qr.manager.findOne).toHaveBeenCalledWith(Post, {
        where: { id },
        relations: ['comments'],
      });
      expect(qr.manager.delete).toHaveBeenCalledWith(CommentModel, {
        post,
      });
      expect(qr.manager.delete).toHaveBeenCalledWith(Post, id);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const id = 1;

      jest.spyOn(qr.manager, 'findOne').mockResolvedValue(null);

      await expect(postService.remove(id, qr)).rejects.toThrow(
        NotFoundException,
      );
      expect(qr.manager.findOne).toHaveBeenCalledWith(Post, {
        where: { id },
        relations: ['comments'],
      });
    });
  });

  describe('isPostMine', () => {
    it('should return true if the post belongs to the user', async () => {
      const userId = 1;
      const postId = 1;

      jest.spyOn(postRepository, 'exists').mockResolvedValue(true);

      const result = await postService.isPostMine(userId, postId);

      expect(result).toBe(true);
      expect(postRepository.exists).toHaveBeenCalledWith({
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
    });

    it('should return false if the post does not belong to the user', async () => {
      const userId = 1;
      const postId = 1;

      jest.spyOn(postRepository, 'exists').mockResolvedValue(false);

      const result = await postService.isPostMine(userId, postId);

      expect(result).toBe(false);
      expect(postRepository.exists).toHaveBeenCalledWith({
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
    });
  });
  describe('togglePostLike', () => {
    let qr: jest.Mocked<QueryRunner>;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          delete: jest.fn(),
          update: jest.fn(),
          save: jest.fn(),
          createQueryBuilder: jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
          }),
        },
      } as any as jest.Mocked<QueryRunner>;
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const postId = 1;
      const userId = 1;
      const isLike = true;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        postService.togglePostLike(postId, userId, isLike, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const postId = 1;
      const userId = 1;
      const isLike = true;
      const post = new Post();
      post.id = postId;

      (qr.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(post)
        .mockResolvedValueOnce(null);

      await expect(
        postService.togglePostLike(postId, userId, isLike, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete like record if isLike is the same', async () => {
      const postId = 1;
      const userId = 1;
      const isLike = true;
      const post = new Post();
      post.id = postId;
      const user = new User();
      user.id = userId;
      const likeRecord = { post, user, isLike };

      (qr.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(post)
        .mockResolvedValueOnce(user);
      jest
        .spyOn(postService, 'getLikedRecord')
        .mockResolvedValueOnce(likeRecord);

      await postService.togglePostLike(postId, userId, isLike, qr);

      expect(qr.manager.delete).toHaveBeenCalledWith(PostUserLike, {
        post,
        user,
      });
    });

    it('should update like record if isLike is different', async () => {
      const postId = 1;
      const userId = 1;
      const isLike = true;
      const post = new Post();
      post.id = postId;
      const user = new User();
      user.id = userId;
      const likeRecord = { post, user, isLike: false };

      (qr.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(post)
        .mockResolvedValueOnce(user);
      jest
        .spyOn(postService, 'getLikedRecord')
        .mockResolvedValueOnce(likeRecord);

      await postService.togglePostLike(postId, userId, isLike, qr);

      expect(qr.manager.update).toHaveBeenCalledWith(
        PostUserLike,
        { post, user },
        { isLike },
      );
    });

    it('should save new like record if none exists', async () => {
      const postId = 1;
      const userId = 1;
      const isLike = true;
      const post = new Post();
      post.id = postId;
      const user = new User();
      user.id = userId;

      (qr.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(post)
        .mockResolvedValueOnce(user);
      jest.spyOn(postService, 'getLikedRecord').mockResolvedValueOnce(null);

      await postService.togglePostLike(postId, userId, isLike, qr);

      expect(qr.manager.save).toHaveBeenCalledWith(PostUserLike, {
        post,
        user,
        isLike,
      });
    });

    it('should return the updated like status', async () => {
      const postId = 1;
      const userId = 1;
      const isLike = true;
      const post = new Post();
      post.id = postId;
      const user = new User();
      user.id = userId;
      const likeRecord = { post, user, isLike };

      (qr.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(post)
        .mockResolvedValueOnce(user);
      jest
        .spyOn(postService, 'getLikedRecord')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(likeRecord);

      const result = await postService.togglePostLike(
        postId,
        userId,
        isLike,
        qr,
      );

      expect(result).toEqual({ isLike });
    });
  });
});
