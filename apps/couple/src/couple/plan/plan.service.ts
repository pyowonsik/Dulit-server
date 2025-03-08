import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from './entity/plan.entity';
import { Repository } from 'typeorm';
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
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly coupleService: CoupleService,
    private readonly paginationService: PaginationService,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto) {
    const { meta, topic, location, time } = createPlanDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const plan = this.planRepository.create({
      topic,
      location,
      time,
      coupleId,
    });

    await this.planRepository.save(plan);
    return plan;
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

    let [data, count] = await qb.getManyAndCount();

    // 기존 반환값에 cursor를 넣어줌
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

    const anniversary = await this.planRepository.findOne({
      where: {
        id: planId,
      },
    });

    if (!anniversary) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    return anniversary;
  }

  async updatePlan(updatePlanDto: UpdatePlanDto) {
    const { meta, topic, location, time, planId } = updatePlanDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    const plany = await this.planRepository.findOne({
      where: {
        id: planId,
      },
    });

    if (!plany) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    await this.planRepository.update(
      {
        id: planId,
      },
      {
        topic,
        location,

        time,
      },
    );

    const newPlan = await this.planRepository.findOne({
      where: {
        id: planId,
      },
    });

    return newPlan;
  }

  async deletePlan(GetPlanDto: GetPlanDto) {
    const { meta, planId } = GetPlanDto;

    // 1) 커플 정보 메세지 패턴으로 가져오기
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

    await this.planRepository.delete({
      id: planId,
    });

    return planId;
  }
}
