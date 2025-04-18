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
import { existsSync, unlinkSync } from 'fs';
import { rename } from 'fs/promises';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { Couple } from 'src/couple/entity/couple.entity';
import { CalendarResponseDto } from './dto/calendar-response.dto';
import { CoupleService } from '../couple.service';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from 'src/common/const/env.const';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    private readonly coupleService: CoupleService,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
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
      } catch (e) {
        console.log('파일 이동 중 오류 발생', e.message);
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
      // movie 생성시, temp폴더의 movieFile을 movie폴더로 이동 시킨다.
      const tempFolder = join('public', 'temp');
      const filesFolder = join('public', 'files/calendar');

      // 1. delete local 기존 파일
      if (calendar.filePaths?.length)
        await this.deleteOldFiles(calendar.filePaths, filesFolder);

      // 2. 파일 이동 (병렬 처리)
      try {
        await Promise.all(
          updateCalendarDto.filePaths.map(
            async (file) =>
              await this.renameFiles(tempFolder, filesFolder, file),
          ),
        );
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw new BadRequestException(
            '파일 이동에 실패했습니다. 파일 경로를 확인해주세요.',
          );
        }
        throw err;
      }
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
      return false;
    }

    const exists = await this.isExistsCalendar(calendarId, couple.id);

    return exists;
  }

  /* istanbul ignore next */
  async deleteOldFiles(filePaths: string[], filesFolder: string) {
    if (this.configService.get<string>(envVariableKeys.env) !== 'prod') {
      filePaths.forEach((file) => {
        const filePath = join(filesFolder, file);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });
    } else {
      return filePaths.forEach((file) => {
        this.commonService.deleteOldFilesFromStorage(file, 'calendar');
      });
    }
  }

  /* istanbul ignore next */
  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    if (this.configService.get<string>(envVariableKeys.env) !== 'prod') {
      return rename(
        join(process.cwd(), tempFolder, file),
        join(process.cwd(), filesFolder, file),
      );
    } else {
      return this.commonService.saveMovieToPermanentStorage(file, 'calendar');
    }
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
