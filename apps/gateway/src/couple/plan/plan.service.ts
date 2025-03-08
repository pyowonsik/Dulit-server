import { COUPLE_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { GetPlansDto } from './dto/get-plans.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PalnService {
  constructor(
    @Inject(COUPLE_SERVICE)
    private readonly coupleMicroservice: ClientProxy,
  ) {}

  createPlan(ceeatePlanDto: CreatePlanDto, userPayload: UserPayloadDto) {
    return this.coupleMicroservice.send(
      {
        cmd: 'create_plan',
      },
      {
        ...ceeatePlanDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getPlans(getPlansDto: GetPlansDto, userPayload: UserPayloadDto) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_plans',
      },
      {
        ...getPlansDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }
  getPlan(userPayload: UserPayloadDto, planId: string) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_plan',
      },
      {
        // ...getAnniversaryDto,
        planId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  updatePlan(
    updatePlanDto: UpdatePlanDto,
    userPayload: UserPayloadDto,
    planId: string,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'update_plan',
      },
      {
        ...updatePlanDto,
        planId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  deletePlan(userPayload: UserPayloadDto, planId: string) {
    return this.coupleMicroservice.send(
      {
        cmd: 'delete_plan',
      },
      {
        planId,
        meta: {
          user: userPayload,
        },
      },
    );
  }
}
