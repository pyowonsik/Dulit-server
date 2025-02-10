import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Couple } from 'src/user/entity/couple.entity';
import { Plan } from './entities/plan.entity';
import { User } from 'src/user/entity/user.entity';
import { In, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(id: number, createPlanDto: CreatePlanDto, qr: QueryRunner) {
    // createDto : topic , location , time
    // topic : 발산역 데이트
    // location : 서울특별시 강서구 공항대로 지하267 (마곡동 727-1496)
    // time : 14:00
    // find : couple , author

    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([id]),
        },
      },
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const author = await qr.manager.findOne(User, { where: { id } });

    if (!author) {
      throw new NotFoundException('존재하지 않는 USER의 ID 입니다.');
    }

    const plan = await qr.manager.create(Plan, {
      ...createPlanDto,
      author,
      couple,
    });

    await qr.manager.save(Plan, plan);

    return plan;
  }

  async findAll() {
    const plans = await this.planRepository.find();
    // const plans = this.planRepository
    // .createQueryBuilder('plan')
    // .getMany();
    return plans;
  }

  async findOne(id: number) {
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

  async update(id: number, updatePlanDto: UpdatePlanDto, qr: QueryRunner) {
    // updateDto : topic? , location? , time?
    // topic : 발산역 데이트
    // location : 서울특별시 강서구 공항대로 지하267 (마곡동 727-1496)
    // time : 14:00
    // find : couple , author

    // const testObj = await this.userRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.couple', 'couple')
    //   .leftJoinAndSelect('user.posts', 'posts')
    //   .leftJoinAndSelect('user.plans', 'plans')
    //   .where('user.id = :userId', { userId: 1 })
    //   .getOne();

    const plan = qr.manager.findOne(Plan, {
      where: {
        id,
      },
    });

    if (!plan) {
      throw new NotFoundException('존재하지 않는 PLAN의 ID 입니다.');
    }

    await qr.manager.update(Plan, id, updatePlanDto);

    const newPlan = await qr.manager.findOne(Plan, { where: { id } });

    return newPlan;
  }

  async remove(id: number) {
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

  async isPlanMine(userId: number, planId: number) {
    // const user = await this.userRepository.findOne({
    //   where: {
    //     id: userId,
    //   },
    //   relations: ['couple'],
    // });

    // const isOk =  await this.planRepository.exists({
    //   where: {
    //     id: planId,
    //     couple: user.couple,
    //   },
    //   relations: {
    //     author: true,
    //     couple: true,
    //   },
    // });

    return this.planRepository.exists({
      where: {
        id: planId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
