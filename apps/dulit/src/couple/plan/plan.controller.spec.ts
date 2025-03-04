import { TestBed } from '@automock/jest';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { PlanResponseDto } from './dto/plan-response.dto';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GetPlanDto } from './dto/get-plan.dto';

describe('PlanController', () => {
  let planController: PlanController;
  let planService: jest.Mocked<PlanService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(PlanController).compile();

    planController = unit;
    planService = unitRef.get(PlanService);
  });

  it('should be defined', () => {
    expect(planController).toBeDefined();
  });

  describe('create', () => {
    it('should call planService.create with correct parameters', async () => {
      const userId = 1;
      const qr = {} as any;
      const createPlanDto: CreatePlanDto = {
        topic: 'Meeting',
        location: '',
        time: undefined,
      };
      const planResponse: PlanResponseDto = {
        id: 0,
        topic: '',
        location: '',
        time: undefined,
      };

      jest.spyOn(planService, 'create').mockResolvedValue(planResponse);

      const result = await planController.create(userId, qr, createPlanDto);

      expect(planService.create).toHaveBeenCalledWith(
        userId,
        createPlanDto,
        qr,
      );
      expect(planService.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(planResponse);
    });
  });

  describe('findAll', () => {
    it('should call planService.findAll with correct parameters', async () => {
      const userId = 1;
      const plans = [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ] as Plan[];
      const nextCursor = 'nextCursor';
      const count = 1;
      const dto: GetPlanDto = {
        topic: 'topic',
        order: [],
        take: 0,
      };
      const resultDto = {
        data: plans,
        nextCursor,
        count,
      };

      jest.spyOn(planService, 'findAll').mockResolvedValue(resultDto);

      const result = await planController.findAll(userId, dto);

      expect(planService.findAll).toHaveBeenCalledWith(userId, dto);
      expect(planService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(resultDto);
    });
  });

  describe('findOne', () => {
    it('should call planService.findOne with correct parameters', async () => {
      const userId = 1;
      const planId = 2;
      const plan = {
        id: 1,
      } as Plan;

      jest.spyOn(planService, 'findOne').mockResolvedValue(plan);

      const result = await planController.findOne(userId, planId);

      expect(planService.findOne).toHaveBeenCalledWith(userId, planId);
      expect(planService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(plan);
    });
  });

  describe('update', () => {
    it('should call planService.update with correct parameters', async () => {
      const userId = 1;
      const planId = 2;
      const qr = {} as any;
      const updatePlanDto: UpdatePlanDto = { topic: 'Updated Meeting' };
      const planResponse: PlanResponseDto = {
        id: 0,
        topic: '',
        location: '',
        time: undefined,
      };

      jest.spyOn(planService, 'update').mockResolvedValue(planResponse);

      const result = await planController.update(
        userId,
        planId,
        updatePlanDto,
        qr,
      );

      expect(planService.update).toHaveBeenCalledWith(
        userId,
        planId,
        updatePlanDto,
        qr,
      );
      expect(planService.update).toHaveBeenCalledTimes(1);
      expect(result).toBe(planResponse);
    });
  });

  describe('remove', () => {
    it('should call planService.remove with correct parameters', async () => {
      const userId = 1;
      const planId = 2;

      jest.spyOn(planService, 'remove').mockResolvedValue(undefined);

      await planController.remove(userId, planId);

      expect(planService.remove).toHaveBeenCalledWith(userId, planId);
      expect(planService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
