import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { Repository } from 'typeorm';
import { CommentModel } from './entity/comment.entity';
import { Post } from '../entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { CommonService } from 'src/common/common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { take } from 'rxjs';

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockPostRepository = {
  findOne: jest.fn(),
};

const mockCommentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  // getComments -> findAll()에서 mock
  // getCommentsMock = jest.spyOn(commentService, 'getComments');
};

const mockCommonService = {
  applyPagePaginationParamsToQb: jest.fn(),
};

describe('CommentService', () => {
  let commentService: CommentService;
  let userRepository: Repository<User>;
  let postRepository: Repository<Post>;
  let commentRepository: Repository<CommentModel>;
  let commonService: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(CommentModel),
          useValue: mockCommentRepository,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    commentRepository = module.get<Repository<CommentModel>>(
      getRepositoryToken(CommentModel),
    );
    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('findAll', () => {
    let getCommentsMock: jest.SpyInstance;

    beforeEach(() => {
      getCommentsMock = jest.spyOn(commentService, 'getComments');
    });

    it('should return comments if post exists', async () => {
      const postId = 1;
      const dto = { page: 1, take: 10 };
      const mockPost = { id: postId, comments: [] };
      const mockComments = [{ id: 1, text: 'test comment' }];

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);

      getCommentsMock.mockResolvedValue({
        getMany: jest.fn().mockResolvedValue(mockComments),
      });

      const result = await commentService.findAll(dto, postId);

      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });

      expect(getCommentsMock).toHaveBeenCalledWith(postId);
      expect(commonService.applyPagePaginationParamsToQb).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const postId = 1;
      const dto = { page: 1, take: 10 };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(commentService.findAll(dto, postId)).rejects.toThrow(
        NotFoundException,
      );

      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });

      expect(getCommentsMock).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const userId = 1;
      const postId = 1;
      const createCommentDto: CreateCommentDto = { comment: '테스트 댓글' };

      const mockUser = { id: userId, name: '테스트 유저' };
      const mockPost = { id: postId, title: '테스트 게시글' };
      const mockComment = {
        id: 1,
        comment: createCommentDto.comment,
        author: mockUser,
        post: mockPost,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest
        .spyOn(commentRepository, 'create')
        .mockReturnValue(mockComment as CommentModel);
      jest
        .spyOn(commentRepository, 'save')
        .mockResolvedValue(mockComment as CommentModel);

      const result = await commentService.create(
        createCommentDto,
        userId,
        postId,
      );

      expect(result).toEqual(mockComment);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(commentRepository.create).toHaveBeenCalledWith({
        comment: createCommentDto.comment,
        author: mockUser,
        post: mockPost,
      });
      expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const createCommentDto: CreateCommentDto = { comment: 'test comment' };

      await expect(
        commentService.create(createCommentDto, 1, 1),
      ).rejects.toThrow(
        new NotFoundException('존재하지 않는 USER의 ID 입니다.'),
      );
    });

    it('should throw NotFoundException if post does not exist', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      const createCommentDto: CreateCommentDto = { comment: 'test comment' };

      await expect(
        commentService.create(createCommentDto, 1, 1),
      ).rejects.toThrow(
        new NotFoundException('존재하지 않는 POST의 ID 입니다.'),
      );
    });
  });

  describe('findOne', () => {
    it('should return the comment if post and comment exist', async () => {
      const postId = 1;
      const commentId = 1;
      const mockPost = { id: postId, comments: [] }; // Mocked post object
      const mockComment = { id: commentId }; // Mocked comment object

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValue(mockComment as CommentModel);

      const result = await commentService.findOne(postId, commentId);

      expect(result).toBe(mockComment);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const postId = 1;
      const commentId = 1;

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(
        commentService.findOne(postId, commentId),
      ).rejects.toThrowError(
        new NotFoundException('존재하지 않는 POST의 ID 입니다.'),
      );
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      const postId = 1;
      const commentId = 1;
      const mockPost = { id: postId, comments: [] }; // Mocked post object

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(
        commentService.findOne(postId, commentId),
      ).rejects.toThrowError(
        new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.'),
      );
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const postId = 1;
      const commentId = 1;
      const updateCommentDto: UpdateCommentDto = { comment: 'test comment' };

      const mockUser = { id: 1, name: '테스트 유저' };
      const mockPost = { id: postId, title: '테스트 게시글' };
      const mockComment = {
        id: commentId,
        comment: '기존 댓글',
        author: mockUser,
        post: mockPost,
      };

      const updatedMockComment = {
        ...mockComment,
        comment: updateCommentDto.comment,
      };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValueOnce(mockComment as CommentModel)
        .mockResolvedValueOnce(updatedMockComment as CommentModel);
      jest.spyOn(commentRepository, 'update').mockResolvedValue(undefined);

      const result = await commentService.update(
        postId,
        commentId,
        updateCommentDto,
      );

      expect(result).toEqual(updatedMockComment);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['post'],
      });
      expect(commentRepository.update).toHaveBeenCalledWith(
        commentId,
        updateCommentDto,
      );
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['post', 'author'],
      });
    });

    it('should throw NotFoundException if the post does not exist', async () => {
      const postId = 1;
      const commentId = 1;
      const updateCommentDto = { comment: '수정된 댓글' };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(
        commentService.update(postId, commentId, updateCommentDto),
      ).rejects.toThrow(
        new NotFoundException('존재하지 않는 POST의 ID 입니다.'),
      );

      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
    });

    it('should throw NotFoundException if the comment does not exist', async () => {
      const postId = 1;
      const commentId = 1;
      const updateCommentDto = { comment: '수정된 댓글' };
      const mockPost = { id: postId, title: '테스트 게시글' };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(
        commentService.update(postId, commentId, updateCommentDto),
      ).rejects.toThrow(
        new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.'),
      );

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['post'],
      });
    });
  });

  describe('remove', () => {
    it('should remove a comment successfully', async () => {
      const postId = 1;
      const commentId = 1;

      const mockPost = { id: postId, title: '테스트 게시글' };
      const mockComment = {
        id: commentId,
        comment: '테스트 댓글',
        post: mockPost,
      };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValue(mockComment as CommentModel);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(undefined);

      const result = await commentService.remove(postId, commentId);

      expect(result).toBe(commentId);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['post'],
      });
      expect(commentRepository.delete).toHaveBeenCalledWith(commentId);
    });

    it('should throw NotFoundException if the post does not exist', async () => {
      const postId = 1;
      const commentId = 1;

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(commentService.remove(postId, commentId)).rejects.toThrow(
        new NotFoundException('존재하지 않는 POST의 ID 입니다.'),
      );

      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['comments'],
      });
    });

    it('should throw NotFoundException if the comment does not exist', async () => {
      const postId = 1;
      const commentId = 1;
      const mockPost = { id: postId, title: '테스트 게시글' };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as Post);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(commentService.remove(postId, commentId)).rejects.toThrow(
        new NotFoundException('존재하지 않는 COMMENT의 ID 입니다.'),
      );

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['post'],
      });
    });
  });

  describe('isCommentMine', () => {
    it('should return true if comment is mine', async () => {
      const userId = 1;
      const commentId = 1;
      const existsMock = jest.fn().mockResolvedValue(true);
      commentRepository.exists = existsMock;

      const result = await commentService.isCommentMine(userId, commentId);

      expect(result).toBe(true);
      expect(existsMock).toHaveBeenCalledWith({
        where: { id: commentId, author: { id: userId } },
        relations: { author: true },
      });
    });

    it('should return false if comment is not mine', async () => {
      const userId = 1;
      const commentId = 1;
      const existsMock = jest.fn().mockResolvedValue(false);
      commentRepository.exists = existsMock;

      const result = await commentService.isCommentMine(userId, commentId);

      expect(result).toBe(false);
      expect(existsMock).toHaveBeenCalledWith({
        where: { id: commentId, author: { id: userId } },
        relations: { author: true },
      });
    });
  });
});
