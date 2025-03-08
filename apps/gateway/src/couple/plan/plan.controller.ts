import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserPayloadDto } from '@app/common/dto';
import { UserPayload } from '../../auth/decorator/user-payload.decorator';
import { PalnService } from './plan.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GetPlansDto } from './dto/get-plans.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller('couple')
export class PlanController {
  constructor(private readonly planService: PalnService) {}

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
  async updatePlan(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updatePlanDto: UpdatePlanDto,
    @Param('planId') planId: string,
  ) {
    return this.planService.updatePlan(updatePlanDto, userPayload, planId);
  }

  @Delete('/plan/:planId')
  async deletePlan(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('planId') planId: string,
  ) {
    return this.planService.deletePlan(userPayload, planId);
  }
  //
}
