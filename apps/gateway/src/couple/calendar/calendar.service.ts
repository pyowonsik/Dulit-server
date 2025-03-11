import { COUPLE_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { GetCalendarsDto } from './dto/get-calendars.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CalendarService {
  constructor(
    @Inject(COUPLE_SERVICE)
    private readonly coupleMicroservice: ClientProxy,
  ) {}

  createCalendar(
    createCalendarDto: CreateCalendarDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'create_calendar',
      },
      {
        ...createCalendarDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getCalendars(getCalendarsDto: GetCalendarsDto, userPayload: UserPayloadDto) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_calendars',
      },
      {
        ...getCalendarsDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getCalendar(userPayload: UserPayloadDto, calendarId: string) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_calendar',
      },
      {
        // ...getCalendarDto,
        calendarId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  updateCalendar(
    updateCalendarDto: UpdateCalendarDto,
    userPayload: UserPayloadDto,
    calendarId: string,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'update_calendar',
      },
      {
        ...updateCalendarDto,
        calendarId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  deleteCalendar(userPayload: UserPayloadDto, calendarId: string) {
    return this.coupleMicroservice.send(
      {
        cmd: 'delete_calendar',
      },
      {
        calendarId,
        meta: {
          user: userPayload,
        },
      },
    );
  }
  async isCalendarCoupleOrAdmin(userPayload: UserPayloadDto, calendarId: string) {
    return await lastValueFrom(
      this.coupleMicroservice.send(
        {
          cmd: 'is_calendar_couple_or_admin',
        },
        {
          calendarId,
          meta: {
            user: userPayload,
          },
        },
      ),
    );
  }
}
