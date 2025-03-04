import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { Calendar } from './entities/calendar.entity';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { rename } from 'fs/promises';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { Couple } from 'src/couple/entity/couple.entity';
import { CalendarResponseDto } from './dto/calendar-response.dto';
import { CoupleService } from '../couple.service';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    private readonly coupleService: CoupleService,
  ) {}

  async create(
    userId: number,
    createCalendarDto: CreateCalendarDto,
    qr: QueryRunner,
  ) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['calendars'],
    });

    if (createCalendarDto.filePaths) {
      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/calendar');

      // if (!existsSync(filesFolder)) {
      //   mkdirSync(filesFolder, { recursive: true });
      // }

      if (
        !createCalendarDto.filePaths ||
        createCalendarDto.filePaths.length === 0
      ) {
        throw new BadRequestException('이동할 파일이 없습니다.');
      }

      try {
        await Promise.all(
          createCalendarDto.filePaths.map(async (file) => {
            await this.renameFiles(tempFolder, filesFolder, file);
          }),
        );
      } catch (error) {
        // console.error('파일 이동 중 오류 발생:', error);
        throw new InternalServerErrorException('파일 이동에 실패했습니다.');
      }
    }

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendar = await qr.manager.create(Calendar, {
      ...createCalendarDto,
      couple,
    });

    const savedCalendar = await qr.manager.save(Calendar, calendar);

    return new CalendarResponseDto(savedCalendar);
  }

  async findAll(userId: number, getCalendarDto: GetCalendarDto) {
    // 월별 페이지 네이션 적용
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'calendars',
    ]);

    if (getCalendarDto.month) {
      const filteredCalender = couple.calendars.filter((calendar) => {
        const date = new Date(calendar.date);
        return date.getMonth() === getCalendarDto.month;
      });

      return filteredCalender;
    }

    return couple.calendars;
  }

  async findOne(userId: number, id: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'calendars',
    ]);

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendar = await this.calendarRepository.findOne({
      where: {
        id,
      },
    });

    if (!calendar) {
      throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
    }

    return calendar;
  }

  async update(
    userId: number,
    id: number,
    updateCalendarDto: UpdateCalendarDto,
    qr: QueryRunner,
  ) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['calendars'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const calendar = await this.calendarRepository.findOne({
      where: {
        id,
      },
    });

    if (!calendar) {
      throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
    }

    if (updateCalendarDto.filePaths) {
      if (!calendar.filePaths) {
        throw new BadRequestException('파일 선업로드 후 요청해주세요.');
      }

      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/calendar');

      // 1. public/files의 post.filePaths 삭제
      calendar.filePaths.forEach((file) => {
        const filePath = join(filesFolder, file);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });

      // 2. 파일 이동 (병렬 처리)
      await Promise.all(
        updateCalendarDto.filePaths.map(
          async (file) => await this.renameFiles(tempFolder, filesFolder, file),
        ),
      );
    }

    // 3. post의 filePaths 수정
    await qr.manager.update(
      Calendar,
      { id },
      { ...updateCalendarDto, filePaths: updateCalendarDto.filePaths },
    );

    const newCalendar = await qr.manager.findOne(Calendar, { where: { id } });

    return new CalendarResponseDto(newCalendar);
  }

  async remove(userId: number, id: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'calendars',
    ]);
    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의의 ID 입니다.');
    }

    const calendar = await this.calendarRepository.findOne({
      where: {
        id,
      },
    });

    if (!calendar) {
      throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
    }

    await this.calendarRepository.delete(id);
    return id;
  }

  async isCalendarCouple(userId: number, calendarId: number) {
    const couple = await this.findMyCouple(userId);

    if (!couple) {
      return false; // 사용자가 커플에 속하지 않음
    }

    const exists = await this.isExistsCalendar(calendarId, userId);

    return exists;
  }

  /* istanbul ignore next */
  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    return await rename(
      join(process.cwd(), tempFolder, file),
      join(process.cwd(), filesFolder, file),
    );
  }

  /* istanbul ignore next */
  async findMyCouple(userId: number) {
    return this.coupleRepository
      .createQueryBuilder('couple')
      .leftJoin('couple.users', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  /* istanbul ignore next */
  async isExistsCalendar(calendarId: number, coupleId: number) {
    return await this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.id = :calendarId', { calendarId })
      .andWhere('calendar.coupleId = :coupleId', { coupleId })
      .getExists();
  }
}
