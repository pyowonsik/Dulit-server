import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { CommentModel } from '../comment/entity/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, CommentModel])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
