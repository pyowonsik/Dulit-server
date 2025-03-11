import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserPayloadDto } from '@app/common/dto';
import { UserPayload } from '../../auth/decorator/user-payload.decorator';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GetPlansDto } from './dto/get-plans.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanService } from './plan.service';
import { IsPlanCoupleOrAdminGuard } from './guard/is-plan-couple-or-admin.guard';

@Controller('couple')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('/plan')
  async createPlan(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createPlanDto: CreatePlanDto,
  ) {
    return this.planService.createPlan(createPlanDto, userPayload);
  }

  @Get('/plans')
  async getPlans(
    @UserPayload() userPayload: UserPayloadDto,
    @Query() getPlansDto: GetPlansDto,
  ) {
    return this.planService.getPlans(getPlansDto, userPayload);
  }

  @Get('/plan/:planId')
  async getPlan(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('planId') planId: string,
  ) {
    return this.planService.getPlan(userPayload, planId);
  }

  @Patch('/plan/:planId')
  @UseGuards(IsPlanCoupleOrAdminGuard)
  async updatePlan(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updatePlanDto: UpdatePlanDto,
    @Param('planId') planId: string,
  ) {
    return this.planService.updatePlan(updatePlanDto, userPayload, planId);
  }

  @Delete('/plan/:planId')
  @UseGuards(IsPlanCoupleOrAdminGuard)
  async deletePlan(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('planId') planId: string,
  ) {
    return this.planService.deletePlan(userPayload, planId);
  }
  //
}
