import { Test, TestingModule } from '@nestjs/testing';
import { AnniversaryService } from './anniversary.service';
import { Couple } from '../entity/couple.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { CoupleService } from '../couple.service';
import { CommonService } from 'src/common/common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { AnniversaryResponseDto } from './dto/anniversary-response.dto';
import { NotFoundException } from '@nestjs/common';
import { Anniversary } from './entity/anniversary.entity';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';

const mockAnniversaryRepository = {
  findOne: jest.fn(),
  delete: jest.fn(),
};

const mockCoupleRepository = {};

const mockCoupleService = {
  findCoupleRelationChild: jest.fn(),
};
const mockCommonService = {
  applyPagePaginationParamsToQb: jest.fn(),
};

describe('AnniversaryService', () => {
  let anniversaryService: AnniversaryService;
  let anniversaryRepository: Repository<Anniversary>;
  let coupleRepository: Repository<Couple>;
  let coupleService: CoupleService;
  let commonService: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnniversaryService,
        {
          provide: getRepositoryToken(Anniversary),
          useValue: mockAnniversaryRepository,
        },
        {
          provide: getRepositoryToken(Couple),
          useValue: mockCoupleRepository,
        },
        {
          provide: CoupleService,
          useValue: mockCoupleService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
      ],
    }).compile();

    anniversaryService = module.get<AnniversaryService>(AnniversaryService);
    anniversaryRepository = module.get<Repository<Anniversary>>(
      getRepositoryToken(Anniversary),
    );
    coupleRepository = module.get<Repository<Couple>>(
      getRepositoryToken(Couple),
    );
    coupleService = module.get<CoupleService>(CoupleService);
    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(anniversaryService).toBeDefined();
  });

  describe('create', () => {
    let qr: jest.Mocked<QueryRunner>;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
    });

    it('should create and save a new anniversary', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const createAnniversaryDto: CreateAnniversaryDto = {
        title: '',
        date: undefined,
      };
      const anniversaryResponseDto: AnniversaryResponseDto = {
        id: 1,
        title: createAnniversaryDto.title,
        date: createAnniversaryDto.date,
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValue(couple);
      (qr.manager.create as jest.Mock).mockReturnValue(anniversaryResponseDto);
      (qr.manager.save as jest.Mock).mockResolvedValue(anniversaryResponseDto);

      const result = await anniversaryService.create(
        userId,
        createAnniversaryDto,
        qr,
      );

      expect(qr.manager.findOne).toHaveBeenCalledWith(Couple, {
        where: {
          users: {
            id: In([userId]),
          },
        },
        relations: ['anniversaries'],
      });

      expect(result).toEqual(anniversaryResponseDto);
      expect(qr.manager.create).toHaveBeenCalledWith(Anniversary, {
        ...createAnniversaryDto,
        couple,
      });
      expect(qr.manager.save).toHaveBeenCalledWith(Anniversary, result);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const createAnniversaryDto: CreateAnniversaryDto = {
        title: '',
        date: undefined,
      };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(
        anniversaryService.create(userId, createAnniversaryDto, qr),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    let findCoupleRelationChildMock: jest.SpyInstance;
    let findMyCoupleAnniversaryMock: jest.SpyInstance;
    let applyPagePaginationMock: jest.SpyInstance;

    beforeEach(() => {
      findCoupleRelationChildMock = jest.spyOn(
        anniversaryService['coupleService'],
        'findCoupleRelationChild',
      );

      findMyCoupleAnniversaryMock = jest.spyOn(
        anniversaryService,
        'findMyCoupleAnniversary',
      );

      applyPagePaginationMock = jest.spyOn(
        commonService,
        'applyPagePaginationParamsToQb',
      );
    });

    it('should return anniversaries if couple exists', async () => {
      const userId = 1;
      const dto = { title: 'meeting', page: 0, take: 10 };
      const mockCouple = { id: 1 };
      const mockAnniversaries = [{ id: 1, title: 'meeting' }];
      const qb = {
        getMany: jest.fn().mockResolvedValue(mockAnniversaries),
      };

      findCoupleRelationChildMock.mockResolvedValue(mockCouple);
      findMyCoupleAnniversaryMock.mockResolvedValue(qb);

      const result = await anniversaryService.findAll(userId, dto);

      expect(findCoupleRelationChildMock).toHaveBeenCalledWith(userId, [
        'anniversaries',
      ]);
      expect(findMyCoupleAnniversaryMock).toHaveBeenCalledWith(mockCouple.id);
      expect(applyPagePaginationMock).toHaveBeenCalledWith(qb, dto);
      expect(qb.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockAnniversaries);
    });
    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const dto = { title: 'meeting', page: 0, take: 10 };

      findCoupleRelationChildMock.mockResolvedValue(null);

      await expect(anniversaryService.findAll(userId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(findCoupleRelationChildMock).toHaveBeenCalledWith(userId, [
        'anniversaries',
      ]);

      expect(findMyCoupleAnniversaryMock).not.toHaveBeenCalled();
      expect(applyPagePaginationMock).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a plan when found', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const anniversaryResponseDto: AnniversaryResponseDto = {
        id: 1,
        title: 'title',
        date: undefined,
      };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest
        .spyOn(anniversaryRepository, 'findOne')
        .mockResolvedValue(anniversaryResponseDto as Anniversary);

      const result = await anniversaryService.findOne(
        userId,
        anniversaryResponseDto.id,
      );

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
        ['anniversaries'],
      );

      expect(result).toEqual(anniversaryResponseDto);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const anniversaryId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(
        anniversaryService.findOne(userId, anniversaryId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        anniversaryService.findOne(userId, anniversaryId),
      ).rejects.toThrow('존재하지 않는 COUPLE의 ID 입니다.');
    });

    it('should throw NotFoundException if anniversary does not exist', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(anniversaryRepository, 'findOne').mockResolvedValue(null);

      await expect(anniversaryService.findOne(userId, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(anniversaryService.findOne(userId, 1)).rejects.toThrow(
        '존재하지 않는 ANNIVERSARY의 ID 입니다.',
      );
    });
  });

  describe('update', () => {
    let qr: jest.Mocked<QueryRunner>;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          update: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
    });

    it('should update the anniversary when valid inputs are provided', async () => {
      const userId = 1;
      const couple = { id: 1, anniversaries: [{ id: 1 }] } as Couple;
      const anniversaryId = 1;
      const updateAnniversaryDto: UpdateAnniversaryDto = {
        title: 'Updated Title',
        date: new Date(),
      };
      const anniversaryResponseDto: AnniversaryResponseDto = {
        id: 1,
        title: updateAnniversaryDto.title,
        date: updateAnniversaryDto.date,
      };

      (qr.manager.findOne as jest.Mock).mockImplementation(
        (entity, options) => {
          if (entity === Couple) return Promise.resolve(couple);
          if (entity === Anniversary)
            return Promise.resolve({
              id: anniversaryId,
              ...updateAnniversaryDto,
            });
          return Promise.resolve(null);
        },
      );

      (qr.manager.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await anniversaryService.update(
        userId,
        anniversaryId,
        updateAnniversaryDto,
        qr,
      );

      expect(qr.manager.findOne).toHaveBeenCalledWith(
        Couple,
        expect.any(Object),
      );
      expect(qr.manager.findOne).toHaveBeenCalledWith(Anniversary, {
        where: { id: anniversaryId },
      });
      expect(qr.manager.update).toHaveBeenCalledWith(
        Anniversary,
        { id: anniversaryId },
        updateAnniversaryDto,
      );
      expect(result).toEqual(anniversaryResponseDto);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      (qr.manager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(anniversaryService.update(1, 1, {}, qr)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if anniversary does not exist', async () => {
      const couple = { id: 1 } as Couple;

      (qr.manager.findOne as jest.Mock).mockImplementation((entity) => {
        if (entity === Couple) return Promise.resolve(couple);
        if (entity === Anniversary) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      await expect(anniversaryService.update(1, 1, {}, qr)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const anniversaryId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(
        anniversaryService.remove(userId, anniversaryId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if anniversary does not exist', async () => {
      const userId = 1;
      const anniversaryId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(anniversaryRepository, 'findOne').mockResolvedValue(null);

      await expect(
        anniversaryService.remove(userId, anniversaryId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete the plan and return the id', async () => {
      const userId = 1;
      const anniversaryId = 1;
      const couple = { id: 1 } as Couple;
      const anniversary = { id: anniversaryId } as Anniversary;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest
        .spyOn(anniversaryRepository, 'findOne')
        .mockResolvedValue(anniversary);

      jest.spyOn(anniversaryRepository, 'delete').mockResolvedValue(undefined);

      const result = await anniversaryService.remove(userId, anniversaryId);

      expect(anniversaryRepository.delete).toHaveBeenCalledWith(anniversary.id);

      expect(result).toBe(anniversaryId);
    });
  });

  describe('isAnniversaryCouple', () => {
    let isExistsAnniversaryMock: jest.SpyInstance;

    beforeEach(() => {
      isExistsAnniversaryMock = jest.spyOn(
        anniversaryService,
        'isExistsAnniversary',
      );
    });

    it('should return false if the couple does not exist', async () => {
      const userId = 1;
      const anniversaryId = 1;

      jest.spyOn(anniversaryService, 'findMyCouple').mockResolvedValue(null);

      const result = await anniversaryService.isAnniversaryCouple(
        userId,
        anniversaryId,
      );

      expect(anniversaryService.findMyCouple).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });

    it('should return the result of isExistsAnniversary if the couple exists', async () => {
      const userId = 1;
      const anniversaryId = 1;
      const couple = { id: 1 } as Couple;

      jest.spyOn(anniversaryService, 'findMyCouple').mockResolvedValue(couple);

      isExistsAnniversaryMock.mockResolvedValue(true);

      const result = await anniversaryService.isAnniversaryCouple(
        userId,
        anniversaryId,
      );

      expect(anniversaryService.findMyCouple).toHaveBeenCalledWith(userId);
      expect(isExistsAnniversaryMock).toHaveBeenCalledWith(
        anniversaryId,
        couple.id,
      );
      expect(result).toBe(true);
    });

    it('should return false if the anniversary does not exist for the couple', async () => {
      const userId = 1;
      const anniversaryId = 1;
      const couple = { id: 1 } as Couple;

      jest.spyOn(anniversaryService, 'findMyCouple').mockResolvedValue(couple);

      isExistsAnniversaryMock.mockResolvedValue(false);

      const result = await anniversaryService.isAnniversaryCouple(
        userId,
        anniversaryId,
      );

      expect(isExistsAnniversaryMock).toHaveBeenCalledWith(
        anniversaryId,
        couple.id,
      );
      expect(result).toBe(false);
    });
  });
});
