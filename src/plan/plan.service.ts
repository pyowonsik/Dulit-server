import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Couple } from 'src/user/entity/couple.entity';
import { Plan } from './entities/plan.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

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
  async create(createPlanDto: CreatePlanDto) {
    return 'This action adds a new plan';
  }

  async findAll() {
    const plans = await this.planRepository.find();
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

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
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
}
