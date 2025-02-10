import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { MulterModule } from '@nestjs/platform-express';
import { v4 } from 'uuid';
import { join } from 'path';
import { diskStorage } from 'multer';
import { Post } from 'src/post/entity/post.entity';
import { TaskService } from './task.service';
import { Plan } from 'src/plan/entities/plan.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Couple } from 'src/user/entity/couple.entity';

@Module({
  imports: [
    // 파일 저장소 지정
    // process.cwd : 현재 프로젝트의 최상단 경로
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
    TypeOrmModule.forFeature([Post, Plan,Couple]),
    NotificationModule,
  ],
  controllers: [CommonController],
  providers: [CommonService, TaskService],
  exports: [CommonService],
})
export class CommonModule {}
