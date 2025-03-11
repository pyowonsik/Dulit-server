import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from './entity/plan.entity';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CoupleService } from '../couple.service';
import { PaginationService } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { GetPlanDto } from './dto/get-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GetPlansDto } from './dto/get-plans.dto';

@Injectable()
export class PlanService {
  constructor(
    private readonly dataSource: DataSource, 
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly coupleService: CoupleService,
    private readonly paginationService: PaginationService,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, topic, location, time } = createPlanDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const plan = queryRunner.manager.create(Plan, {
        topic,
        location,
        time,
        coupleId,
      });

      await queryRunner.manager.save(plan);
      await queryRunner.commitTransaction();

      return plan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePlan(updatePlanDto: UpdatePlanDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, topic, location, time, planId } = updatePlanDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const plan = await queryRunner.manager.findOne(Plan, {
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
      }

      await queryRunner.manager.update(
        Plan,
        { id: planId },
        {
          topic,
          location,
          time,
        },
      );

      const updatedPlan = await queryRunner.manager.findOne(Plan, {
        where: { id: planId },
      });

      await queryRunner.commitTransaction();

      return updatedPlan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deletePlan(getPlanDto: GetPlanDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, planId } = getPlanDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const plan = await queryRunner.manager.findOne(Plan, {
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
      }

      await queryRunner.manager.delete(Plan, { id: planId });

      await queryRunner.commitTransaction();

      return planId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPlans(getPlansDto: GetPlansDto) {
    const { meta, topic } = getPlansDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    const qb = this.planRepository
      .createQueryBuilder('plan')
      .where(`plan.coupleId = :coupleId`, { coupleId });

    if (topic) {
      qb.andWhere('plan.topic LIKE :topic', { topic: `%${topic}%` });
    }

    const { nextCursor } =
      await this.paginationService.applyCursorPaginationParamsToQb(
        qb,
        getPlansDto,
      );

    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      nextCursor,
      count,
    };
  }

  async getPlan(getPlanDto: GetPlanDto) {
    const { meta, planId } = getPlanDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const plan = await this.planRepository.findOne({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
    }

    return plan;
  }

  async isPlanCoupleOrAdmin(getPlanDto: GetPlanDto) {
    const { meta, planId } = getPlanDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      return false; // 사용자가 커플에 속하지 않음
    }

    const exists = await this.planRepository
      .createQueryBuilder('plan')
      .where('plan.id = :planId', { planId })
      .andWhere('plan.coupleId = :coupleId', { coupleId })
      .getExists();

    return exists;
  }
}
