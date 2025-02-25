import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { IsCalendarCoupleOrAdmin } from './guard/is-calendar-couple-or-admin.guard';
import { GetCalendarDto } from './dto/get-calendar.dto';

@Controller('/couple/calendar')
@ApiTags('calendar')
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({
    summary: '캘린더 일정 작성',
    description: '캘린더 일정 작성',
  })
  @UseInterceptors(TransactionInterceptor)
  create(
    @UserId() userId: number,
    @Body() createCalendarDto: CreateCalendarDto,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.calendarService.create(userId, createCalendarDto, qr);
  }

  @Get()
  @ApiOperation({
    summary: '캘린더 일정 조회',
    description: '캘린더 일정 조회',
  })
  findAll(@UserId() userId: number,@Body() getCalendarDto : GetCalendarDto) {
    return this.calendarService.findAll(userId,getCalendarDto);
  }

  @Get(':calendarId')
  @ApiOperation({
    summary: '단건 캘린더 일정 조회',
    description: '단건 캘린더 일정 조회',
  })
  findOne(
    @UserId() userId: number,
    @Param('calendarId', ParseIntPipe) id: number,
  ) {
    return this.calendarService.findOne(userId, id);
  }

  @Patch(':calendarId')
  @ApiOperation({
    summary: '캘린더 일정 수정',
    description: '캘린더 일정 수정',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsCalendarCoupleOrAdmin)
  update(
    @UserId() userId: number,
    @Param('calendarId', ParseIntPipe) id: number,
    @Body() updateCalendarDto: UpdateCalendarDto,
    @QueryRunner() qr: QR,
  ) {
    return this.calendarService.update(userId, id, updateCalendarDto,qr);
  }

  @Delete(':calendarId')
  @ApiOperation({
    summary: '캘린더 일정 삭제',
    description: '캘린더 일정 삭제',
  })
  @UseGuards(IsCalendarCoupleOrAdmin)
  remove(
    @UserId() userId: number,
    @Param('calendarId', ParseIntPipe) id: number,
  ) {
    return this.calendarService.remove(userId, id);
  }
}
