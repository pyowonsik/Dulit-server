import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';
import { AnniversaryController } from './anniversary/anniversary.controller';
import { AnniversaryService } from './anniversary/anniversary.service';
import { PlanController } from './plan/plan.controller';
import { PalnService } from './plan/plan.service';

@Module({
  controllers: [CoupleController, AnniversaryController, PlanController],
  providers: [CoupleService, AnniversaryService, PalnService],
})
export class CoupleModule {}
