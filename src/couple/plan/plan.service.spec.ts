import { Test, TestingModule } from '@nestjs/testing';
import { PlanService } from './plan.service';
import { In, QueryRunner, Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Couple } from '../entity/couple.entity';
import { Plan } from './entities/plan.entity';
import { CommonService } from 'src/common/common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoupleService } from '../couple.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { NotFoundException } from '@nestjs/common';
import { GetPlanDto } from './dto/get-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

const mockPlanRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};
const mockUserRepository = {};
const mockCoupleService = {
  findCoupleRelationChild: jest.fn(),
};
const mockCommonService = {
  applyCursorPaginationParamsToQb: jest.fn(),
};

describe('PlanService', () => {
  let planService: PlanService;
  let userRepository: Repository<User>;
  let planRepository: Repository<Plan>;
  let coupleService: CoupleService;
  let commonService: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Plan),
          useValue: mockPlanRepository,
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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    coupleService = module.get<CoupleService>(CoupleService);
    planRepository = module.get<Repository<Plan>>(getRepositoryToken(Plan));
    commonService = module.get<CommonService>(CommonService);
    planService = module.get<PlanService>(PlanService);
  });

  it('should be defined', () => {
    expect(planService).toBeDefined();
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

    it('should create and save a new plan', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const createPlanDto: CreatePlanDto = {
        topic: '',
        location: '',
        time: undefined,
      };
      const planResponseDto: PlanResponseDto = {
        id: 1,
        topic: createPlanDto.topic,
        location: createPlanDto.location,
        time: createPlanDto.time,
      };
      (qr.manager.findOne as jest.Mock).mockResolvedValue(couple);
      (qr.manager.create as jest.Mock).mockReturnValue(planResponseDto);
      (qr.manager.save as jest.Mock).mockResolvedValue(planResponseDto);

      const result = await planService.create(userId, createPlanDto, qr);

      expect(qr.manager.findOne).toHaveBeenCalledWith(Couple, {
        where: {
          users: {
            id: In([userId]),
          },
        },
        relations: ['plans'],
      });

      expect(result).toEqual(planResponseDto);
      expect(qr.manager.create).toHaveBeenCalledWith(Plan, {
        ...createPlanDto,
        couple,
      });
      expect(qr.manager.save).toHaveBeenCalledWith(Plan, result);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const createPlanDto: CreatePlanDto = {
        topic: '',
        location: '',
        time: undefined,
      };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(
        planService.create(userId, createPlanDto, qr),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('findAll', () => {
    let findMeRelationCoupleMock: jest.SpyInstance;
    let findMyCouplePlanMock: jest.SpyInstance;
    let applyCursorPaginationMock: jest.SpyInstance;
    let qb: any;

    beforeEach(() => {
      findMeRelationCoupleMock = jest.spyOn(
        planService,
        'findMeRelationCouple',
      );
      findMyCouplePlanMock = jest.spyOn(planService, 'findMyCouplePlan');
      applyCursorPaginationMock = jest.spyOn(
        commonService,
        'applyCursorPaginationParamsToQb',
      );

      qb = {
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
    });

    it('should return plans with pagination', async () => {
      const userId = 1;
      const dto: GetPlanDto = {
        topic: 'meeting',
        cursor: '123',
        take: 10,
        order: [],
      };
      const user = { couple: { id: 1 } };
      const plans = [{ id: 1, topic: 'meeting' }];
      const nextCursor = 'next-cursor';

      findMeRelationCoupleMock.mockResolvedValue(user);
      findMyCouplePlanMock.mockResolvedValue(qb);
      applyCursorPaginationMock.mockResolvedValue({ nextCursor });

      qb.getManyAndCount.mockResolvedValue([plans, plans.length]);

      const result = await planService.findAll(userId, dto);

      expect(findMeRelationCoupleMock).toHaveBeenCalledWith(userId);
      expect(findMyCouplePlanMock).toHaveBeenCalledWith(user.couple.id);
      expect(qb.andWhere).toHaveBeenCalledWith('plan.topic LIKE :topic', {
        topic: '%meeting%',
      });

      expect(applyCursorPaginationMock).toHaveBeenCalledWith(qb, dto);

      expect(result).toEqual({
        data: plans,
        nextCursor,
        count: plans.length,
      });
    });

    it('should return plans without topic filter', async () => {
      const userId = 1;
      const dto: GetPlanDto = {
        cursor: '123',
        take: 10,
        order: [],
      };
      const user = { couple: { id: 1 } };
      const plans = [{ id: 1, topic: 'event' }];
      const nextCursor = 'next-cursor';

      findMeRelationCoupleMock.mockResolvedValue(user);
      findMyCouplePlanMock.mockResolvedValue(qb);
      applyCursorPaginationMock.mockResolvedValue({ nextCursor });

      qb.getManyAndCount.mockResolvedValue([plans, plans.length]);

      const result = await planService.findAll(userId, dto);

      expect(findMeRelationCoupleMock).toHaveBeenCalledWith(userId);
      expect(findMyCouplePlanMock).toHaveBeenCalledWith(user.couple.id);

      expect(qb.andWhere).not.toHaveBeenCalled();

      expect(applyCursorPaginationMock).toHaveBeenCalledWith(qb, dto);

      expect(result).toEqual({
        data: plans,
        nextCursor,
        count: plans.length,
      });
    });
  });

  describe('findOne', () => {
    it('should return a plan when found', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;
      const planResponseDto = {
        id: 1,
        topic: 'topic',
        location: 'location',
        time: undefined,
      };

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest
        .spyOn(planRepository, 'findOne')
        .mockResolvedValue(planResponseDto as Plan);

      // Call the service method
      const result = await planService.findOne(userId, planResponseDto.id);

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
        ['plans'],
      );

      expect(result).toEqual(planResponseDto);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const planId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      await expect(planService.findOne(userId, planId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(planService.findOne(userId, planId)).rejects.toThrow(
        '존재하지 않는 COUPLE의 ID 입니다.',
      );
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      const userId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(planRepository, 'findOne').mockResolvedValue(null);

      await expect(planService.findOne(userId, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(planService.findOne(userId, 1)).rejects.toThrow(
        '존재하지 않는 PLAN의 ID 입니다.',
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

    it('should update the plan when valid inputs are provided', async () => {
      const userId = 1;
      const couple = { id: 1, plans: [{ id: 1 }] } as Couple;
      const planId = 1;
      const updatePlanDto: UpdatePlanDto = {
        topic: '',
        location: '',
        time: undefined,
      };
      const planResponseDto: PlanResponseDto = {
        id: 1,
        topic: updatePlanDto.topic,
        location: updatePlanDto.location,
        time: undefined,
      };

      (qr.manager.findOne as jest.Mock).mockImplementation((entity) => {
        if (entity === Couple) return Promise.resolve(couple);
        if (entity === Plan)
          return Promise.resolve({
            id: planId,
            ...updatePlanDto,
          });
        return Promise.resolve(null);
      });

      (qr.manager.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await planService.update(
        userId,
        planId,
        updatePlanDto,
        qr,
      );

      expect(qr.manager.findOne).toHaveBeenCalledWith(
        Couple,
        expect.any(Object),
      );
      expect(qr.manager.findOne).toHaveBeenCalledWith(Plan, {
        where: { id: planId },
      });
      expect(qr.manager.update).toHaveBeenCalledWith(
        Plan,
        planId,
        updatePlanDto,
      );
      expect(result).toEqual(planResponseDto);
    });

    it('should throw NotFoundException if couple does not exist', async () => {
      (qr.manager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(planService.update(1, 1, {}, qr)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      const couple = { id: 1 } as Couple;

      (qr.manager.findOne as jest.Mock).mockImplementation((entity) => {
        if (entity === Couple) return Promise.resolve(couple);
        if (entity === Plan) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      await expect(planService.update(1, 1, {}, qr)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if couple does not exist', async () => {
      const userId = 1;
      const planId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

        await expect(planService.remove(userId, planId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      const userId = 1;
      const planId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(planRepository, 'findOne').mockResolvedValue(null);

      await expect(planService.remove(userId, planId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete the plan and return the id', async () => {
      const userId = 1;
      const planId = 1;
      const couple = { id: 1 } as Couple;
      const plan = { id: planId } as Plan;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      jest.spyOn(planRepository, 'findOne').mockResolvedValue(plan);

      jest.spyOn(planRepository, 'delete').mockResolvedValue(undefined);

      const result = await planService.remove(userId, planId);

      expect(planRepository.delete).toHaveBeenCalledWith(plan.id);

      expect(result).toBe(planId);
    });
  });

  describe('isPlanCouple', () => {
    let isExistsPlanMock: jest.SpyInstance;

    beforeEach(() => {
      isExistsPlanMock = jest.spyOn(planService, 'isExistsPlan');
    });

    it('should return false if the couple does not exist', async () => {
      const userId = 1;
      const planId = 1;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(null);

      const result = await planService.isPlanCouple(userId, planId);

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
      );

      expect(result).toBe(false);
    });

    it('should return the result of isExistsPlan if the couple exists', async () => {
      const userId = 1;
      const planId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      isExistsPlanMock.mockResolvedValue(true);

      const result = await planService.isPlanCouple(userId, planId);

      expect(coupleService.findCoupleRelationChild).toHaveBeenCalledWith(
        userId,
      );

      expect(isExistsPlanMock).toHaveBeenCalledWith(planId, couple.id);

      expect(result).toBe(true);
    });

    it('should return false if the plan does not exist for the couple', async () => {
      const userId = 1;
      const planId = 1;
      const couple = { id: 1 } as Couple;

      jest
        .spyOn(coupleService, 'findCoupleRelationChild')
        .mockResolvedValue(couple);

      isExistsPlanMock.mockResolvedValue(false);

      const result = await planService.isPlanCouple(userId, planId);

      expect(isExistsPlanMock).toHaveBeenCalledWith(planId, couple.id);

      expect(result).toBe(false);
    });
  });
});
