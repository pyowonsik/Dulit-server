import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { UserPayloadDto } from '@app/common/dto';
import { CalendarService } from './calendar.service';
import { UserPayload } from '../../auth/decorator/user-payload.decorator';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { GetCalendarsDto } from './dto/get-calendars.dto';

import { FilesInterceptor } from '@nestjs/platform-express';
import { IsCalendarCoupleOrAdmin } from './guard/is-calendar-couple-or-admin.guard';

@Controller('couple')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('/calendar')
  async createCalendar(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    return this.calendarService.createCalendar(createCalendarDto, userPayload);
  }

  @Get('/calendars')
  async getCalendars(
    @UserPayload() userPayload: UserPayloadDto,
    @Query() getCalendarsDto: GetCalendarsDto,
  ) {
    return this.calendarService.getCalendars(getCalendarsDto, userPayload);
  }

  @Get('/calendar/:calendarId')
  async getCalendar(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('calendarId') calendarId: string,
  ) {
    return this.calendarService.getCalendar(userPayload, calendarId);
  }

  @Patch('/calendar/:calendarId')
  @UseGuards(IsCalendarCoupleOrAdmin)
  async updateCalendar(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updateCalendarDto: UpdateCalendarDto,
    @Param('calendarId') calendarId: string,
  ) {
    return this.calendarService.updateCalendar(
      updateCalendarDto,
      userPayload,
      calendarId,
    );
  }

  @Delete('/calendar/:calendarId')
  @UseGuards(IsCalendarCoupleOrAdmin)
  async deleteCalendar(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('calendarId') calendarId: string,
  ) {
    return this.calendarService.deleteCalendar(userPayload, calendarId);
  }

  @Post('/calendar/upload/files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // 파일 사이즈 제한
      limits: {
        fileSize: 20000000,
      },
      fileFilter(req, file, callback) {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/mpeg',
          'video/webm',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              '이미지 또는 영상 파일만 업로드 가능합니다.',
            ),
            false,
          );
        }
        return callback(null, true);
      },
    }),
  )
  async createFiles(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const fileNames = files.map((file) => file.filename);

    return {
      fileNames: fileNames,
    };
  }
}
