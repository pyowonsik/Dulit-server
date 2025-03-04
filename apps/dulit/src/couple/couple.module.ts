import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Couple } from './entity/couple.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { AnniversaryModule } from './anniversary/anniversary.module';
import { CalendarModule } from './calendar/calendar.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Couple]),
    AnniversaryModule,
    CalendarModule,
    PlanModule,
    NotificationModule,
  ],
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
