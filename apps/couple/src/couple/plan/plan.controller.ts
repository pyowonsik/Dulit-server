import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GetPlanDto } from './dto/get-plan.dto';
import { GetPlansDto } from './dto/get-plans.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @MessagePattern({
    cmd: 'create_plan',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createPlan(@Payload() payload: CreatePlanDto) {
    return this.planService.createPlan(payload);
  }

  @MessagePattern({
    cmd: 'get_plan',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getPlan(@Payload() payload: GetPlanDto) {
    return this.planService.getPlan(payload);
  }

  @MessagePattern({
    cmd: 'get_plans',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getAnniversaries(@Payload() payload: GetPlansDto) {
    return this.planService.getPlans(payload);
  }

  @MessagePattern({
    cmd: 'update_plan',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  updatePlan(@Payload() payload: UpdatePlanDto) {
    return this.planService.updatePlan(payload);
  }

  @MessagePattern({
    cmd: 'delete_plan',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  deletePlan(@Payload() payload: GetPlanDto) {
    return this.planService.deletePlan(payload);
  }

  @MessagePattern({
    cmd: 'is_plan_couple_or_admin',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  isPlanCoupleOrAdmin(@Payload() payload: GetPlanDto) {
    return this.planService.isPlanCoupleOrAdmin(payload);
  }
}
