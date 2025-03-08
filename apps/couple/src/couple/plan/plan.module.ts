import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { CommonModule } from '@app/common';
import { CoupleModule } from '../couple.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entity/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan]), CoupleModule, CommonModule],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
