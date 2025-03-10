import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PostModule } from '../post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModel } from './entity/comment.entity';
import { Post } from '../post/entity/post.entity';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentModel, Post]),
    PostModule,
    CommonModule,
  ],

  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
