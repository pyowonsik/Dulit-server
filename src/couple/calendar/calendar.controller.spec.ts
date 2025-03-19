import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { QueryRunner } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TestBed } from '@automock/jest';
import { CalendarResponseDto } from './dto/calendar-response.dto';
import { Calendar } from './entities/calendar.entity';

describe('CalendarController', () => {
  let calendarController: CalendarController;
  let calendarService: jest.Mocked<CalendarService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CalendarController).compile();

    calendarController = unit;
    calendarService = unitRef.get(CalendarService);
  });

  it('should be defined', () => {
    expect(calendarController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new calendar', async () => {
      const userId = 1;
      const createCalendarDto: CreateCalendarDto = {
        title: 'Test',
        description: 'Test',
        date: new Date(),
      };
      const queryRunner: QueryRunner = {} as QueryRunner;
      const expectedResult = {
        id: 1,
        title: 'Test',
        description: 'Test',
        date: new Date(),
      };

      calendarService.create.mockResolvedValue(
        expectedResult as CalendarResponseDto,
      );

      const result = await calendarController.create(
        userId,
        createCalendarDto,
        queryRunner,
      );

      expect(result).toEqual(expectedResult);
      expect(calendarService.create).toHaveBeenCalledWith(
        userId,
        createCalendarDto,
        queryRunner,
      );
    });
  });

  describe('findAll', () => {
    it('should return all calendars', async () => {
      const userId = 1;
      const getCalendarDto: GetCalendarDto = {};
      const expectedResult = [
        { id: 1, title: 'Test', description: 'Test', date: new Date() },
      ];

      calendarService.findAll.mockResolvedValue(expectedResult as Calendar[]);

      const result = await calendarController.findAll(userId, getCalendarDto);

      expect(result).toEqual(expectedResult);
      expect(calendarService.findAll).toHaveBeenCalledWith(
        userId,
        getCalendarDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single calendar', async () => {
      const userId = 1;
      const calendarId = 1;
      const expectedResult = {
        id: 1,
        title: 'Test',
        description: 'Test',
        date: new Date(),
      };

      calendarService.findOne.mockResolvedValue(expectedResult as Calendar);

      const result = await calendarController.findOne(userId, calendarId);

      expect(result).toEqual(expectedResult);
      expect(calendarService.findOne).toHaveBeenCalledWith(userId, calendarId);
    });

    it('should throw NotFoundException if calendar does not exist', async () => {
      const userId = 1;
      const calendarId = 1;

      calendarService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        calendarController.findOne(userId, calendarId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a calendar', async () => {
      const userId = 1;
      const calendarId = 1;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Test',
        description: 'Updated Test',
        date: new Date(),
      };
      const queryRunner: QueryRunner = {} as QueryRunner;
      const expectedResult = {
        id: 1,
        title: 'Updated Test',
        description: 'Updated Test',
        date: new Date(),
      };

      calendarService.update.mockResolvedValue(
        expectedResult as CalendarResponseDto,
      );

      const result = await calendarController.update(
        userId,
        calendarId,
        updateCalendarDto,
        queryRunner,
      );

      expect(result).toEqual(expectedResult);
      expect(calendarService.update).toHaveBeenCalledWith(
        userId,
        calendarId,
        updateCalendarDto,
        queryRunner,
      );
    });

    it('should throw NotFoundException if calendar does not exist', async () => {
      const userId = 1;
      const calendarId = 1;
      const updateCalendarDto: UpdateCalendarDto = {
        title: 'Updated Test',
        description: 'Updated Test',
        date: new Date(),
      };
      const queryRunner: QueryRunner = {} as QueryRunner;

      calendarService.update.mockRejectedValue(new NotFoundException());

      await expect(
        calendarController.update(
          userId,
          calendarId,
          updateCalendarDto,
          queryRunner,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a calendar', async () => {
      const userId = 1;
      const calendarId = 1;

      calendarService.remove.mockResolvedValue(undefined);

      const result = await calendarController.remove(userId, calendarId);

      expect(result).toBeUndefined();
      expect(calendarService.remove).toHaveBeenCalledWith(userId, calendarId);
    });

    it('should throw NotFoundException if calendar does not exist', async () => {
      const userId = 1;
      const calendarId = 1;

      calendarService.remove.mockRejectedValue(new NotFoundException());

      await expect(
        calendarController.remove(userId, calendarId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
