import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { GetCalendarsDto } from './dto/get-calendars.dto';

@Controller()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @MessagePattern({
    cmd: 'create_calendar',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createCalendar(@Payload() payload: CreateCalendarDto) {
    return this.calendarService.createCalendar(payload);
  }

  @MessagePattern({
    cmd: 'get_calendar',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getCalendar(@Payload() payload: GetCalendarDto) {
    return this.calendarService.getCalendar(payload);
  }

  @MessagePattern({
    cmd: 'get_calendars',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getCalendars(@Payload() payload: GetCalendarsDto) {
    return this.calendarService.getCalendars(payload);
  }

  @MessagePattern({
    cmd: 'update_calendar',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  updateCalendar(@Payload() payload: UpdateCalendarDto) {
    return this.calendarService.updateCalendar(payload);
  }

  @MessagePattern({
    cmd: 'delete_calendar',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  deleteCalendar(@Payload() payload: GetCalendarDto) {
    return this.calendarService.deleteCalendar(payload);
  }
}
