import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Calendar } from './entities/calendar.entity';
import { Couple } from 'src/couple/entity/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Calendar]), CommonModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
