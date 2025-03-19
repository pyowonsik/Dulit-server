import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TestBed } from '@automock/jest';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostDto } from './dto/get-post-dto';
import { QueryRunner } from 'typeorm';
import { Post } from './entity/post.entity';

describe('PostController', () => {
  let postController: PostController;
  let postService: jest.Mocked<PostService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(PostController).compile();

    postController = unit;
    postService = unitRef.get(PostService);
  });

  it('should be defined', () => {
    expect(postController).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test',

        description: 'Test Content',
      };
      const request = { user: { sub: 1 } };
      const qr = {} as QueryRunner;
      const post = {
        id: 0,
        title: createPostDto.title,
        description: createPostDto.description,
        filePaths: [],
      } as Post;

      jest.spyOn(postService, 'create').mockResolvedValue(post);

      const result = await postController.create(request, createPostDto, qr);

      expect(result).toBe(post);
      expect(postService.create).toHaveBeenCalledWith(1, createPostDto, qr);
    });
  });

  describe('findAll', () => {
    it('should find all posts', async () => {
      const getPostDto: GetPostDto = {
        order: [],
        take: 0,
      };
      const nextCursor = 'nextCursor';
      const count = 1;
      const posts = [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ] as Post[];

      const resultDto = {
        data: posts,
        nextCursor,
        count,
      };
      jest.spyOn(postService, 'findAll').mockResolvedValue(resultDto);

      const result = await postController.findAll(getPostDto);

      expect(result).toBe(resultDto);
      expect(postService.findAll).toHaveBeenCalledWith(getPostDto);
    });
  });

  describe('findOne', () => {
    it('should find one post', async () => {
      const postId = 1;

      const post = {
        id: 0,
        title: '',
        description: '',
        filePaths: [],
      } as Post;

      jest.spyOn(postService, 'findOne').mockResolvedValue(post as Post);

      const result = await postController.findOne(postId);

      expect(result).toBe(post as Post);
      expect(postService.findOne).toHaveBeenCalledWith(postId);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const postId = 1;
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        description: 'Updated Content',
      };
      const qr = {} as QueryRunner;
      const post = {
        id: 0,
        title: updatePostDto.title,
        description: updatePostDto.description,
        filePaths: [],
      } as Post;

      jest.spyOn(postService, 'update').mockResolvedValue(post);

      const result = await postController.update(postId, updatePostDto, qr);

      expect(result).toBe(post);
      expect(postService.update).toHaveBeenCalledWith(
        postId,
        updatePostDto,
        qr,
      );
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const postId = 1;
      const qr = {} as QueryRunner;

      jest.spyOn(postService, 'remove').mockResolvedValue(postId);

      const result = await postController.remove(postId, qr);

      expect(result).toBe(postId);
      expect(postService.remove).toHaveBeenCalledWith(postId, qr);
    });
  });

  describe('createPostLike', () => {
    it('should like a post', async () => {
      const postId = 1;
      const userId = 1;
      const qr = {} as QueryRunner;

      jest
        .spyOn(postService, 'togglePostLike')
        .mockResolvedValue({ isLike: true });

      const result = await postController.createPostLike(postId, userId, qr);

      expect(result).toEqual({ isLike: true });
      expect(postService.togglePostLike).toHaveBeenCalledWith(
        postId,
        userId,
        true,
        qr,
      );
    });
  });

  describe('createPostDisLike', () => {
    it('should dislike a post', async () => {
      const postId = 1;
      const userId = 1;
      const qr = {} as QueryRunner;

      jest
        .spyOn(postService, 'togglePostLike')
        .mockResolvedValue({ isLike: false });

      const result = await postController.createPostDisLike(postId, userId, qr);

      expect(result).toEqual({ isLike: false });
      expect(postService.togglePostLike).toHaveBeenCalledWith(
        postId,
        userId,
        false,
        qr,
      );
    });
  });
});
