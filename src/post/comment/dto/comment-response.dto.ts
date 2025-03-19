import { CommentModel } from '../entity/comment.entity';

export class CommentResponseDto {
  id: number;
  comment: string;
  createdAt: Date;
  author: { id: number; name: string };
  post: { id: number; title: string };

  constructor(comment: CommentModel) {
    this.id = comment.id;
    this.comment = comment.comment;
    this.createdAt = comment.createdAt;
    this.author = { id: comment.author.id, name: comment.author.name };
    this.post = { id: comment.post.id, title: comment.post.title };
  }
}
