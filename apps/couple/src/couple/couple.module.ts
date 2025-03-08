import { Module } from '@nestjs/common';
import { CoupleController } from './couple.controller';
import { CoupleService } from './couple.service';
import { Couple } from './entity/couple.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './plan/entity/plan.entity';
import { Anniversary } from './anniversary/entity/anniversary.entity';
import { Calendar } from './calendar/entity/calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple])],
  controllers: [CoupleController],
  providers: [CoupleService],
  exports: [CoupleService],
})
export class CoupleModule {}
