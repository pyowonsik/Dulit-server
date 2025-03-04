import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Post } from './entity/post.entity';
import { CommentModule } from './comment/comment.module';
import { CommentModel } from './comment/entity/comment.entity';
import { PostUserLike } from './comment/entity/post-user-like.entity';
import { CommonModule } from 'src/common/common.module';
import { Couple } from 'src/couple/entity/couple.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Couple, Post, CommentModel,PostUserLike]),
    CommentModule,
    CommonModule
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
