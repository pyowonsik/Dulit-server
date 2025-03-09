import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CoupleModule } from '../couple.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './entity/calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar]), CoupleModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
