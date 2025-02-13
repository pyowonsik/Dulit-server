import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Couple } from 'src/user/entity/couple.entity';
import { Anniversary } from 'src/anniversary/entity/anniversary.entity';
import { CommonModule } from 'src/common/common.module';
import { Calendar } from './entities/calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Calendar]), CommonModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
