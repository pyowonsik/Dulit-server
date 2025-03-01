import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Calendar } from './entities/calendar.entity';
import { Couple } from 'src/couple/entity/couple.entity';
import { CoupleService } from '../couple.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Couple, Calendar]),
    CommonModule,
    NotificationModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService, CoupleService],
})
export class CalendarModule {}
