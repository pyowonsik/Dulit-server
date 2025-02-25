import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { User } from 'src/user/entity/user.entity';
import { CommonModule } from 'src/common/common.module';
import { Couple } from 'src/couple/entity/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Plan, User]), CommonModule],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
