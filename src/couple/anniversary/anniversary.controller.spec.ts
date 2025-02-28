import { Test, TestingModule } from '@nestjs/testing';
import { AnniversaryController } from './anniversary.controller';
import { AnniversaryService } from './anniversary.service';
import { TestBed } from '@automock/jest';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { AnniversaryResponseDto } from './dto/anniversary-response.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { Anniversary } from './entity/anniversary.entity';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';

describe('AnniversaryController', () => {
  let anniversaryController: AnniversaryController;
  let anniversaryService: jest.Mocked<AnniversaryService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AnniversaryController).compile();

    anniversaryController = unit;
    anniversaryService = unitRef.get(AnniversaryService);
  });

  it('should be defined', () => {
    expect(anniversaryController).toBeDefined();
  });

  describe('create', () => {
    it('should call anniversaryService.create with correct parameters', async () => {
      const userId = 1;
      const qr = {} as any;
      const createAnniversaryDto: CreateAnniversaryDto = {
        title: 'Anniversary Title',
        date: new Date(),
      };
      const anniversaryResponse: AnniversaryResponseDto = {
        id: 1,
        title: 'Anniversary Title',
        date: new Date(),
      };

      jest
        .spyOn(anniversaryService, 'create')
        .mockResolvedValue(anniversaryResponse);

      const result = await anniversaryController.create(
        userId,
        qr,
        createAnniversaryDto,
      );

      expect(anniversaryService.create).toHaveBeenCalledWith(
        userId,
        createAnniversaryDto,
        qr,
      );
      expect(anniversaryService.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(anniversaryResponse);
    });
  });

  describe('update', () => {
    it('should call anniversaryService.update with correct parameters', async () => {
      const userId = 1;
      const anniversaryId = 1;
      const qr = {} as any;
      const updateAnniversaryDto: UpdateAnniversaryDto = {
        title: 'Updated Title',
        date: new Date(),
      };
      const anniversaryResponse: AnniversaryResponseDto = {
        id: anniversaryId,
        title: 'Updated Title',
        date: new Date(),
      };

      jest
        .spyOn(anniversaryService, 'update')
        .mockResolvedValue(anniversaryResponse as Anniversary);

      const result = await anniversaryController.update(
        userId,
        anniversaryId,
        updateAnniversaryDto,
        qr,
      );

      expect(anniversaryService.update).toHaveBeenCalledWith(
        userId,
        anniversaryId,
        updateAnniversaryDto,
        qr,
      );
      expect(anniversaryService.update).toHaveBeenCalledTimes(1);
      expect(result).toBe(anniversaryResponse);
    });
  });

  describe('findAll', () => {
    it('should call anniversaryService.findAll with correct parameters', async () => {
      const userId = 1;
      const getAnniversaryDto: GetAnniversaryDto = {
        page: 0,
        take: 0,
      };
      const anniversaryResponse: AnniversaryResponseDto[] = [
        {
          id: 1,
          title: 'Anniversary Title',
          date: new Date(),
        },
      ];

      jest
        .spyOn(anniversaryService, 'findAll')
        .mockResolvedValue(anniversaryResponse as Anniversary[]);

      const result = await anniversaryController.findAll(
        userId,
        getAnniversaryDto,
      );

      expect(anniversaryService.findAll).toHaveBeenCalledWith(
        userId,
        getAnniversaryDto,
      );
      expect(anniversaryService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(anniversaryResponse);
    });
  });

  describe('findOne', () => {
    it('should call anniversaryService.findOne with correct parameters', async () => {
      const userId = 1;
      const anniversaryId = 1;
      const anniversaryResponse: AnniversaryResponseDto = {
        id: anniversaryId,
        title: 'Anniversary Title',
        date: new Date(),
      };

      jest
        .spyOn(anniversaryService, 'findOne')
        .mockResolvedValue(anniversaryResponse as Anniversary);

      const result = await anniversaryController.findOne(userId, anniversaryId);

      expect(anniversaryService.findOne).toHaveBeenCalledWith(
        userId,
        anniversaryId,
      );
      expect(anniversaryService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(anniversaryResponse);
    });
  });

  describe('remove', () => {
    it('should call anniversaryService.remove with correct parameters', async () => {
      const userId = 1;
      const anniversaryId = 1;

      jest.spyOn(anniversaryService, 'remove').mockResolvedValue(undefined);

      const result = await anniversaryController.remove(userId, anniversaryId);

      expect(anniversaryService.remove).toHaveBeenCalledWith(
        userId,
        anniversaryId,
      );
      expect(anniversaryService.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
