import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        // ..../DULIT/public/files
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, cb) => {
          const extension = file.originalname.split('.').pop(); // 확장자 추출
          cb(null, `${v4()}_${Date.now()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [PostController, CommentController],
  providers: [PostService, CommentService],
})
export class PostModule {}
