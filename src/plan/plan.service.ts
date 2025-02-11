import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Couple } from 'src/user/entity/couple.entity';
import { Plan } from './entities/plan.entity';
import { User } from 'src/user/entity/user.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { GetPlanDto } from './dto/get-plan.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
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

  async findAll(userId: number, dto: GetPlanDto) {
    const { topic } = dto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.couple', 'couple')
      .where(`user.id = :userId`, { userId })
      .getOne();
    
    // createQueryBuilder사용시 id값 비교.

    const qb = this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.couple', 'couple')
      .where(`plan.couple = :coupleId`, { coupleId: user.couple.id });


    this.planRepository.find({
      where : {
        couple : user.couple
      }
    })

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
