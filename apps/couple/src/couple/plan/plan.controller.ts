import { Controller } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) {}
}
