import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Couple } from 'src/user/entity/couple.entity';
import { User } from 'src/user/entity/user.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Plan, User]), CommonModule],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
