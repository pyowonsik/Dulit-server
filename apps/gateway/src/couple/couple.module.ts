import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';
import { AnniversaryController } from './anniversary/anniversary.controller';
import { AnniversaryService } from './anniversary/anniversary.service';
import { PlanController } from './plan/plan.controller';
import { PalnService } from './plan/plan.service';
import { CalendarController } from './calendar/calendar.controller';
import { CalendarService } from './calendar/calendar.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';

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
  controllers: [
    CoupleController,
    AnniversaryController,
    PlanController,
    CalendarController,
  ],
  providers: [CoupleService, AnniversaryService, PalnService, CalendarService],
})
export class CoupleModule {}
