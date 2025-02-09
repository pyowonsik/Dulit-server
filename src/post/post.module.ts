import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Couple } from 'src/user/entity/couple.entity';
import { Post } from './entity/post.entity';
import { CommentModule } from './comment/comment.module';
import { CommentModel } from './comment/entity/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Couple, Post, CommentModel]),
    CommentModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
