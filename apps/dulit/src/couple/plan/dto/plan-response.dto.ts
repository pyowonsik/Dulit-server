import { Plan } from "../entities/plan.entity";

export class PlanResponseDto {
    id: number;
    topic: string;
    location: string;
    time: Date;

    constructor(plan: Plan) {
        this.id = plan.id,
        this.topic = plan.topic,
        this.location = plan.location,
        this.time = plan.time
    }
  }
  