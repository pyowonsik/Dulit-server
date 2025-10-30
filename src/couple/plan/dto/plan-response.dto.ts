import { Plan } from '../entities/plan.entity';

export class PlanResponseDto {
  id: number;
  topic: string;
  location: string;
  time: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(plan: Plan) {
    this.id = plan.id;
    this.topic = plan.topic;
    this.location = plan.location;
    this.time = plan.time;
    this.createdAt = plan.createdAt;
    this.updatedAt = plan.updatedAt;
  }
}
