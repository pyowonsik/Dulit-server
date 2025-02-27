import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TestBed } from '@automock/jest';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentDto } from './dto/get-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentModel } from './entity/comment.entity';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: jest.Mocked<CommentService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CommentController).compile();

    commentController = unit;
    commentService = unitRef.get(CommentService);
  });

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  describe('create', () => {
    it('should call CommentService.create with correct parameters', async () => {
      const postId = 1;
      const userId = 10;
      const createCommentDto: CreateCommentDto = { comment: 'Test comment' };

      commentService.create.mockResolvedValue({
        id: 1,
        comment: 'Test comment',
        // createdAt: new Date(),
        author: { id: 1, name: 'John Doe' },
        post: { id: 1, title: 'Test Post' },
      } as CommentModel);

      const req = { user: { sub: userId } };

      const result = await commentController.create(
        postId,
        req,
        createCommentDto,
      );

      expect(commentService.create).toHaveBeenCalledWith(
        createCommentDto,
        userId,
        postId,
      );

      expect(result).toEqual({
        id: 1,
        comment: 'Test comment',
        // createdAt: new Date(),
        author: { id: 1, name: 'John Doe' },
        post: { id: 1, title: 'Test Post' },
      } as CommentModel);
    });
  });

  describe('findAll', () => {
    it('should call CommentService.findAll with correct parameters', async () => {
      const postId = 1;
      const dto: GetCommentDto = { page: 1, take: 10 };

      commentService.findAll.mockResolvedValue([
        { id: 1, comment: 'Test comment' },
      ] as CommentModel[]);

      const result = await commentController.findAll(postId, dto);

      expect(commentService.findAll).toHaveBeenCalledWith(dto, postId);
      expect(result).toEqual([{ id: 1, comment: 'Test comment' }]);
    });
  });

  describe('findOne', () => {
    it('should call CommentService.findOne with correct parameters', async () => {
      const postId = 1;
      const commentId = 2;

      commentService.findOne.mockResolvedValue({
        id: commentId,
        comment: 'Test comment',
      } as CommentModel);

      const result = await commentController.findOne(postId, commentId);

      expect(commentService.findOne).toHaveBeenCalledWith(postId, commentId);
      expect(result).toEqual({ id: commentId, comment: 'Test comment' });
    });
  });

  describe('update', () => {
    it('should call CommentService.update with correct parameters', async () => {
      const postId = 1;
      const commentId = 2;
      const updateCommentDto: UpdateCommentDto = { comment: 'Updated comment' };

      commentService.update.mockResolvedValue({
        id: 1,
        comment: 'Test comment',
        // createdAt: new Date(),
        author: { id: 1, name: 'John Doe' },
        post: { id: 1, title: 'Test Post' },
      } as CommentModel);

      const result = await commentController.update(
        postId,
        commentId,
        updateCommentDto,
      );

      expect(commentService.update).toHaveBeenCalledWith(
        postId,
        commentId,
        updateCommentDto,
      );
      expect(result).toEqual({
        id: 1,
        comment: 'Test comment',
        // createdAt: new Date(),
        author: { id: 1, name: 'John Doe' },
        post: { id: 1, title: 'Test Post' },
      } as CommentModel);
    });
  });

  describe('remove', () => {
    it('should call CommentService.remove with correct parameters', async () => {
      const postId = 1;
      const commentId = 2;

      commentService.remove.mockResolvedValue(commentId);

      const result = await commentController.remove(postId, commentId);

      expect(commentService.remove).toHaveBeenCalledWith(postId, commentId);
      expect(result).toEqual(commentId);
    });
  });
});
