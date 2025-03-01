import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { In, QueryBuilder, QueryRunner, Repository } from 'typeorm';
import { Couple } from '../entity/couple.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Calendar } from './entities/calendar.entity';
import { CoupleService } from '../couple.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CalendarResponseDto } from './dto/calendar-response.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import * as fs from 'fs';

const mockCoupleRepository = {};
const mockCalendarRepository = {
  findOne: jest.fn(),
  delete: jest.fn(),
};
const mockCoupleService = {
  findCoupleRelationChild: jest.fn(),
};

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let coupleRepository: Repository<Couple>;
  let calendarRepository: Repository<Calendar>;
  let coupleService: CoupleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: getRepositoryToken(Couple),
          useValue: mockCoupleRepository,
        },
        {
          provide: getRepositoryToken(Calendar),
          useValue: mockCalendarRepository,
        },
        {
          provide: CoupleService,
          useValue: mockCoupleService,
        },
      ],
    }).compile();

    coupleRepository = module.get<Repository<Couple>>(
      getRepositoryToken(Couple),
    );

    calendarRepository = module.get<Repository<Calendar>>(
      getRepositoryToken(Calendar),
    );

    coupleService = module.get<CoupleService>(CoupleService);
    calendarService = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(calendarService).toBeDefined();
  });

  describe('create', () => {
    let qr: jest.Mocked<QueryRunner>;
    let renameFiles: jest.SpyInstance;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;

      renameFiles = jest.spyOn(calendarService, 'renameFiles');
    });

    it('should create a calendar successfully', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const createCalendarDto: CreateCalendarDto = {
        title: '',
        description: '',
        date: undefined,
      };
      const calendarResponseDto: CalendarResponseDto = {
        id: 0,
        title: '',
        description: '',
        date: undefined,
        filePaths: [],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValue(couple);
      (qr.manager.create as jest.Mock).mockResolvedValue(calendarResponseDto);
      (qr.manager.save as jest.Mock).mockResolvedValue(calendarResponseDto);

      const result = await calendarService.create(
        userId,
        createCalendarDto,
        qr,
      );

      expect(qr.manager.findOne).toHaveBeenCalledWith(Couple, {
        where: {
          users: {
            id: In([userId]),
          },
        },
        relations: ['calendars'],
      });

      expect(result).toEqual(calendarResponseDto);
      expect(qr.manager.create).toHaveBeenCalledWith(Calendar, {
        ...createCalendarDto,
        couple,
      });
      expect(qr.manager.save).toHaveBeenCalledWith(Calendar, result);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const createCalendarDto: CreateCalendarDto = {
        title: '',
        description: '',
        date: undefined,
      };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(
        calendarService.create(userId, createCalendarDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should move files if filePaths are provided', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const createCalendarDto: CreateCalendarDto = {
        title: 'Test Calendar',
        description: 'Test Description',
        date: new Date(),
        filePaths: ['temp/file1.png', 'temp/file2.png'],
      };
      const calendarResponseDto: CalendarResponseDto = {
        id: 1,
        title: 'Test Calendar',
        description: 'Test Description',
        date: new Date(),
        filePaths: ['files/calendar/file1.png', 'files/calendar/file2.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValue(couple);
      (qr.manager.create as jest.Mock).mockResolvedValue(calendarResponseDto);
      (qr.manager.save as jest.Mock).mockResolvedValue(calendarResponseDto);
      renameFiles.mockResolvedValue(undefined);

      const result = await calendarService.create(
        userId,
        createCalendarDto,
        qr,
      );

      expect(renameFiles).toHaveBeenCalledTimes(2);
      expect(renameFiles).toHaveBeenCalledWith(
        'public/temp',
        'public/files/calendar',
        'temp/file1.png',
      );
      expect(renameFiles).toHaveBeenCalledWith(
        'public/temp',
        'public/files/calendar',
        'temp/file2.png',
      );

      expect(result).toEqual(calendarResponseDto);
    });

    it('should throw InternalServerErrorException if file renaming fails', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const createCalendarDto: CreateCalendarDto = {
        title: 'Test Calendar',
        description: 'Test Description',
        date: new Date(),
        filePaths: ['temp/file1.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValue(couple);
      renameFiles.mockRejectedValue(new Error('File rename error'));

      await expect(
        calendarService.create(userId, createCalendarDto, qr),
      ).rejects.toThrow(InternalServerErrorException);

      expect(renameFiles).toHaveBeenCalledTimes(1);
      expect(renameFiles).toHaveBeenCalledWith(
        'public/temp',
        'public/files/calendar',
        'temp/file1.png',
      );
    });

    it('should throw BadRequestException if filePaths are empty', async () => {
      const userId = 1;
      const createCalendarDto: CreateCalendarDto = {
        title: 'Test Calendar',
        description: 'Test Description',
        date: new Date(),
        filePaths: [],
      };

      await expect(
        calendarService.create(userId, createCalendarDto, qr),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all calendars successfully', async () => {
      const userId = 1;
      const getCalendarDto = {};
      const couple = { id: 1, calendars: [{ id: 1, date: new Date() }] };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple as Couple);

      const result = await calendarService.findAll(userId, getCalendarDto);

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
        ['calendars'],
      );
      expect(result).toEqual(couple.calendars);
    });

    it('should return filtered calendars by month', async () => {
      const userId = 1;
      const getCalendarDto = { month: new Date().getMonth() };
      const couple = { id: 1, calendars: [{ id: 1, date: new Date() }] };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple as Couple);
      const result = await calendarService.findAll(userId, getCalendarDto);

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
        ['calendars'],
      );
      expect(result).toEqual(
        couple.calendars.filter((calendar) => {
          const date = new Date(calendar.date);
          return date.getMonth() === getCalendarDto.month;
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a plan when found', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const calendarResponseDto: CalendarResponseDto = {
        id: 1,
        title: 'title',
        date: undefined,
        description: '',
        filePaths: [],
      };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest
        .spyOn(calendarRepository, 'findOne')
        .mockResolvedValue(calendarResponseDto as Calendar);

      const result = await calendarService.findOne(
        userId,
        calendarResponseDto.id,
      );

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
        ['calendars'],
      );

      expect(result).toEqual(calendarResponseDto);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const calendarId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(calendarService.findOne(userId, calendarId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(calendarService.findOne(userId, calendarId)).rejects.toThrow(
        '존재하지 않는 COUPLE의 ID 입니다.',
      );
    });

    it('should throw NotFoundException if calendar does not exist', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(calendarRepository, 'findOne').mockResolvedValue(null);

      await expect(calendarService.findOne(userId, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(calendarService.findOne(userId, 1)).rejects.toThrow(
        '존재하지 않는 CALENDAR의 ID 입니다.',
      );
    });
  });

  describe('update', () => {
    let qr: jest.Mocked<QueryRunner>;
    let renameFiles: jest.SpyInstance;
    let findOneCalendar: jest.SpyInstance;
    let updateCalendar: jest.SpyInstance;
    let existsSyncSpy: jest.SpyInstance;
    let unlinkSyncSpy: jest.SpyInstance;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          update: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;

      renameFiles = jest.spyOn(calendarService, 'renameFiles');
      findOneCalendar = jest.spyOn(
        calendarService['calendarRepository'],
        'findOne',
      );
      updateCalendar = jest.spyOn(qr.manager, 'update');
      existsSyncSpy = jest.spyOn(fs, 'existsSync');
      unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync');
    });

    it('should update a calendar successfully', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;
      const calendar = { id: 1, filePaths: ['file1.png'] } as Calendar;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['temp/file2.png'],
      };
      const calendarResponseDto: CalendarResponseDto = {
        id: 1,
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['files/calendar/file2.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      findOneCalendar.mockResolvedValueOnce(calendar);
      renameFiles.mockResolvedValue(undefined);
      existsSyncSpy.mockReturnValue(true);
      unlinkSyncSpy.mockImplementation(() => {});
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(
        calendarResponseDto,
      );

      const result = await calendarService.update(
        userId,
        calendarId,
        updateCalendarDto,
        qr,
      );

      expect(qr.manager.findOne).toHaveBeenCalledWith(Couple, {
        where: { users: { id: In([userId]) } },
        relations: ['calendars'],
      });
      expect(findOneCalendar).toHaveBeenCalledWith({
        where: { id: calendarId },
      });
      expect(updateCalendar).toHaveBeenCalledWith(
        Calendar,
        { id: calendarId },
        { ...updateCalendarDto, filePaths: updateCalendarDto.filePaths },
      );
      expect(renameFiles).toHaveBeenCalledWith(
        'public/temp',
        'public/files/calendar',
        'temp/file2.png',
      );
      expect(existsSyncSpy).toHaveBeenCalledWith(
        'public/files/calendar/file1.png',
      );
      expect(unlinkSyncSpy).toHaveBeenCalledWith(
        'public/files/calendar/file1.png',
      );
      expect(result).toEqual(calendarResponseDto);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const calendarId = 1;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        calendarService.update(userId, calendarId, updateCalendarDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if calendar does not exist', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      findOneCalendar.mockResolvedValueOnce(null);

      await expect(
        calendarService.update(userId, calendarId, updateCalendarDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if calendar file paths are not provided', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;
      const calendar = { id: 1, filePaths: null } as Calendar;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['temp/file2.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      findOneCalendar.mockResolvedValueOnce(calendar);

      await expect(
        calendarService.update(userId, calendarId, updateCalendarDto, qr),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if file renaming fails', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;
      const calendar = { id: 1, filePaths: ['file1.png'] } as Calendar;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['temp/file2.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      findOneCalendar.mockResolvedValueOnce(calendar);
      renameFiles.mockRejectedValue(
        new InternalServerErrorException('파일 이동에 실패했습니다.'),
      );

      await expect(
        calendarService.update(userId, calendarId, updateCalendarDto, qr),
      ).rejects.toThrow(InternalServerErrorException);

      expect(renameFiles).toHaveBeenCalledWith(
        'public/temp',
        'public/files/calendar',
        'temp/file2.png',
      );
    });

    it('should delete existing files before renaming new ones', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;
      const calendar = {
        id: 1,
        filePaths: ['file1.png', 'file2.png'],
      } as Calendar;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['temp/file3.png'],
      };

      const calendarResponseDto = {
        id: 1,
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['files/calendar/file3.png'],
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(couple);
      findOneCalendar.mockResolvedValueOnce(calendar);
      existsSyncSpy.mockReturnValue(true);
      unlinkSyncSpy.mockImplementation(() => {});
      renameFiles.mockResolvedValue(undefined);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        title: 'Updated Calendar',
        description: 'Updated Description',
        date: new Date(),
        filePaths: ['files/calendar/file3.png'],
      });

      const result = await calendarService.update(
        userId,
        calendarId,
        updateCalendarDto,
        qr,
      );

      expect(existsSyncSpy).toHaveBeenCalledWith(
        'public/files/calendar/file1.png',
      );
      expect(unlinkSyncSpy).toHaveBeenCalledWith(
        'public/files/calendar/file1.png',
      );
      expect(existsSyncSpy).toHaveBeenCalledWith(
        'public/files/calendar/file2.png',
      );
      expect(unlinkSyncSpy).toHaveBeenCalledWith(
        'public/files/calendar/file2.png',
      );
      expect(renameFiles).toHaveBeenCalledWith(
        'public/temp',
        'public/files/calendar',
        'temp/file3.png',
      );
      expect(result).toEqual(calendarResponseDto);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const calendarId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(calendarService.remove(userId, calendarId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if calendar does not exist', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(calendarRepository, 'findOne').mockResolvedValue(null);

      await expect(calendarService.remove(userId, calendarId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete the plan and return the id', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;
      const calendar = { id: calendarId } as Calendar;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(calendarRepository, 'findOne').mockResolvedValue(calendar);

      jest.spyOn(calendarRepository, 'delete').mockResolvedValue(undefined);

      const result = await calendarService.remove(userId, calendarId);

      expect(calendarRepository.delete).toHaveBeenCalledWith(calendar.id);

      expect(result).toBe(calendarId);
    });
  });

  describe('isCalendarCouple', () => {
    let isExistsCalendarMock: jest.SpyInstance;

    beforeEach(() => {
      isExistsCalendarMock = jest.spyOn(calendarService, 'isExistsCalendar');
    });

    it('should return false if the couple does not exist', async () => {
      const userId = 1;
      const calendarId = 1;

      jest.spyOn(calendarService, 'findMyCouple').mockResolvedValue(null);

      const result = await calendarService.isCalendarCouple(userId, calendarId);

      expect(calendarService.findMyCouple).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });

    it('should return the result of isExistsCalendar if the couple exists', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;

      jest.spyOn(calendarService, 'findMyCouple').mockResolvedValue(couple);

      isExistsCalendarMock.mockResolvedValue(true);

      const result = await calendarService.isCalendarCouple(userId, calendarId);

      expect(calendarService.findMyCouple).toHaveBeenCalledWith(userId);
      expect(isExistsCalendarMock).toHaveBeenCalledWith(calendarId, couple.id);
      expect(result).toBe(true);
    });

    it('should return false if the calendar does not exist for the couple', async () => {
      const userId = 1;
      const calendarId = 1;
      const couple = { id: 1 } as Couple;

      jest.spyOn(calendarService, 'findMyCouple').mockResolvedValue(couple);

      isExistsCalendarMock.mockResolvedValue(false);

      const result = await calendarService.isCalendarCouple(userId, calendarId);

      expect(isExistsCalendarMock).toHaveBeenCalledWith(calendarId, couple.id);
      expect(result).toBe(false);
    });
  });
});
