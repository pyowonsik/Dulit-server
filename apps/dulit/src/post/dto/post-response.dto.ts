import { Post } from '../entity/post.entity';

export class PostResponseDto {
  id: number;
  title: string;
  description: string;
  filePaths: string[];

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.description = post.description;
    this.filePaths = post.filePaths;
  }
}
