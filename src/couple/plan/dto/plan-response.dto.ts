import { Plan } from '../entities/plan.entity';

export class PlanResponseDto {
  id: number;
  topic: string;
  location: string;
  time: Date;

  constructor(plan: Plan) {
    this.id = plan.id; // ✅ 세미콜론 사용
    this.topic = plan.topic; // ✅ 세미콜론 사용
    this.location = plan.location; // ✅ 세미콜론 사용
    this.time = plan.time; // ✅ 세미콜론 사용
  }
}
