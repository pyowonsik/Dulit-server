import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Post } from '../entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { CommentModel } from './entity/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, CommentModel])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
