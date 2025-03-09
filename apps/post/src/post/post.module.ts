import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { CommentModel } from '../comment/entity/comment.entity';
import { CommonModule } from '@app/common';

@Module({
  imports: [TypeOrmModule.forFeature([Post, CommentModel]), CommonModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
