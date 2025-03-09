import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Calendar } from './entity/calendar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CoupleService } from '../couple.service';
import { Repository } from 'typeorm';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { GetCalendarsDto } from './dto/get-calendars.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { join } from 'path';
import { rename } from 'fs/promises';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    private readonly coupleService: CoupleService,
  ) {}

  async createCalendar(createCalendarDto: CreateCalendarDto) {
    const { meta, title, description, date, filePaths } = createCalendarDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    if (filePaths) {
      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/calendar');

      if (!existsSync(filesFolder)) {
        mkdirSync(filesFolder, { recursive: true });
      }

      if (!filePaths || filePaths.length === 0) {
        throw new BadRequestException('이동할 파일이 없습니다.');
      }

      try {
        await Promise.all(
          filePaths.map(async (file) => {
            await this.renameFiles(tempFolder, filesFolder, file);
          }),
        );
      } catch (error) {
        // console.error('파일 이동 중 오류 발생:', error);
        throw new InternalServerErrorException('파일 이동에 실패했습니다.');
      }
    }

    const calendar = this.calendarRepository.create({
      title,
      description,
      date,
      filePaths,
      coupleId,
    });

    this.calendarRepository.save(calendar);

    return calendar;
  }
  async getCalendars(getCalendarsDto: GetCalendarsDto) {
    const { meta, month } = getCalendarsDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendars = await this.calendarRepository.find({
      where: {
        coupleId,
      },
    });

    if (month) {
      const filteredCalender = calendars.filter((calendar) => {
        const date = new Date(calendar.date);
        return date.getMonth() === getCalendarsDto.month - 1;
      });

      console.log(filteredCalender);
      return filteredCalender;
    }

    return calendars;
  }

  async getCalendar(getCalendarDto: GetCalendarDto) {
    const { meta, calendarId } = getCalendarDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendar = await this.calendarRepository.findOne({
      where: {
        id: calendarId,
      },
    });

    if (!calendar) {
      throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
    }

    return calendar;
  }
  async updateCalendar(updateCalendarDto: UpdateCalendarDto) {
    const { meta, title, description, date, filePaths, calendarId } =
      updateCalendarDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendar = await this.calendarRepository.findOne({
      where: {
        id: calendarId,
      },
    });

    if (!calendar) {
      throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
    }

    console.log(calendar);

    if (filePaths) {
      if (!filePaths) {
        throw new BadRequestException('파일 선업로드 후 요청해주세요.');
      }

      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/calendar');

      // 1. public/files의 post.filePaths 삭제
      filePaths.forEach((file) => {
        const filePath = join(filesFolder, file);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });

      // 2. 파일 이동 (병렬 처리)
      await Promise.all(
        filePaths.map(
          async (file) => await this.renameFiles(tempFolder, filesFolder, file),
        ),
      );
    }

    await this.calendarRepository.update(
      { id: calendarId },
      {
        title,
        description,
        date,
        filePaths,
        coupleId,
      },
    );

    const newCalendar = await this.calendarRepository.findOne({
      where: {
        id: calendarId,
      },
    });

    return newCalendar;
  }
  async deleteCalendar(getCalendarDto: GetCalendarDto) {
    const { meta, calendarId } = getCalendarDto;

    // 1) 커플 정보 메세지 패턴으로 가져오기
    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendar = await this.calendarRepository.findOne({
      where: {
        id: calendarId,
      },
    });

    if (!calendar) {
      throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
    }

    await this.calendarRepository.delete({
      id: calendarId,
    });

    return calendarId;
  }

  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    return await rename(
      join(process.cwd(), tempFolder, file),
      join(process.cwd(), filesFolder, file),
    );
  }
}
