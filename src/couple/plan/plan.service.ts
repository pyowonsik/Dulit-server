import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { User } from 'src/user/entity/user.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { GetPlanDto } from './dto/get-plan.dto';
import { CommonService } from 'src/common/common.service';
import { CoupleService } from '../couple.service';
import { PlanResponseDto } from './dto/plan-response.dto';
import { Couple } from '../entity/couple.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
    private readonly coupleService: CoupleService,
  ) {}

  async create(userId: number, createPlanDto: CreatePlanDto, qr: QueryRunner) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([userId]),
        },
      },
      relations: ['plans'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const plan = await qr.manager.create(Plan, {
      ...createPlanDto,
      couple,
    });

    const savedPlan = await qr.manager.save(Plan, plan);

    return new PlanResponseDto(savedPlan);
  }

  async findAll(userId: number, dto: GetPlanDto) {
    const { topic } = dto;

    const user = await this.findMeRelationCouple(userId);

    const qb = await this.findMyCouplePlan(user.couple.id);

    this.planRepository.find({
      where: {
        couple: user.couple,
      },
    });

    if (topic) {
      qb.andWhere('plan.topic LIKE :topic', { topic: `%${topic}%` });
    }

    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    let [data, count] = await qb.getManyAndCount();

    // 기존 반환값에 cursor를 넣어줌
    return {
      data,
      nextCursor,
      count,
    };
  }

  async findOne(userId: number, id: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'plans',
    ]);

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const plan = await this.planRepository.findOne({
      where: {
        id,
      },
    });

    if (!plan) {
      throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
    }

    return plan;
  }

  async update(
    userId: number,
    id: number,
    updatePlanDto: UpdatePlanDto,
    qr: QueryRunner,
  ) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['plans'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const plan = await qr.manager.findOne(Plan, {
      where: {
        id,
      },
    });

    if (!plan) {
      throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
    }

    await qr.manager.update(Plan, id, updatePlanDto);

    const savedPlan = await qr.manager.findOne(Plan, { where: { id } });

    return new PlanResponseDto(savedPlan);
  }

  async remove(userId: number, id: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'plans',
    ]);

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의의 ID 입니다.');
    }

    const plan = await this.planRepository.findOne({
      where: {
        id,
      },
    });

    if (!plan) {
      throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
    }

    await this.planRepository.delete(plan.id);

    return id;
  }

  async isPlanCouple(userId: number, planId: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId);

    if (!couple) {
      return false; // 사용자가 커플에 속하지 않음
    }
    const exists = await this.isExistsPlan(planId, couple.id);

    return exists;
  }

  /* istanbul ignore next */
  async findMeRelationCouple(userId: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.couple', 'couple')
      .where(`user.id = :userId`, { userId })
      .getOne();
  }

  /* istanbul ignore next */
  async findMyCouplePlan(coupleId: number) {
    return this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.couple', 'couple')
      .where(`plan.couple = :coupleId`, { coupleId });
  }

  /* istanbul ignore next */
  async isExistsPlan(planId: number, coupleId: number) {
    return this.planRepository
      .createQueryBuilder('plan')
      .where('plan.id = :planId', { planId })
      .andWhere('plan.coupleId = :coupleId', { coupleId })
      .getExists();
  }
}
