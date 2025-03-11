import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Calendar } from './entity/calendar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CoupleService } from '../couple.service';
import { Repository, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource, // DataSource 추가
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    private readonly coupleService: CoupleService,
  ) {}

  async createCalendar(createCalendarDto: CreateCalendarDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, title, description, date, filePaths } = createCalendarDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      if (filePaths) {
        const tempFolder = join('public', 'temp');
        const filesFolder = join('public', 'files/calendar');

        if (!existsSync(filesFolder)) {
          mkdirSync(filesFolder, { recursive: true });
        }

        await Promise.all(
          filePaths.map(async (file) => {
            await this.renameFiles(tempFolder, filesFolder, file);
          }),
        );
      }

      const calendar = queryRunner.manager.create(Calendar, {
        title,
        description,
        date,
        filePaths,
        coupleId,
      });

      await queryRunner.manager.save(calendar);
      await queryRunner.commitTransaction();

      return calendar;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCalendar(updateCalendarDto: UpdateCalendarDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, title, description, date, filePaths, calendarId } =
        updateCalendarDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const calendar = await queryRunner.manager.findOne(Calendar, {
        where: { id: calendarId },
      });

      if (!calendar) {
        throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
      }

      if (filePaths) {
        const tempFolder = join('public', 'temp');
        const filesFolder = join('public', 'files/calendar');

        filePaths.forEach((file) => {
          const filePath = join(filesFolder, file);
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        });

        await Promise.all(
          filePaths.map(async (file) =>
            this.renameFiles(tempFolder, filesFolder, file),
          ),
        );
      }

      await queryRunner.manager.update(
        Calendar,
        { id: calendarId },
        {
          title,
          description,
          date,
          filePaths,
          coupleId,
        },
      );

      const newCalendar = await queryRunner.manager.findOne(Calendar, {
        where: { id: calendarId },
      });

      await queryRunner.commitTransaction();

      return newCalendar;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCalendar(getCalendarDto: GetCalendarDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, calendarId } = getCalendarDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const calendar = await queryRunner.manager.findOne(Calendar, {
        where: { id: calendarId },
      });

      if (!calendar) {
        throw new NotFoundException('존재하지 않는 CALENDAR의 ID 입니다.');
      }

      await queryRunner.manager.delete(Calendar, { id: calendarId });

      await queryRunner.commitTransaction();

      return calendarId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      return calendars.filter((calendar) => {
        const date = new Date(calendar.date);
        return date.getMonth() === month - 1;
      });
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

  async renameFiles(tempFolder: string, filesFolder: string, file: string) {
    return await rename(
      join(process.cwd(), tempFolder, file),
      join(process.cwd(), filesFolder, file),
    );
  }

  async isCalendarCoupleOrAdmin(getCalendarDto: GetCalendarDto) {
    const { meta, calendarId } = getCalendarDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      return false;
    }

    const exists = await this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.id = :calendarId', { calendarId })
      .andWhere('calendar.coupleId = :coupleId', { coupleId })
      .getExists();

    return exists;
  }
}
