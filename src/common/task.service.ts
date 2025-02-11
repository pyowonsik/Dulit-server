import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { Plan } from 'src/plan/entities/plan.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly notificationService: NotificationService,
  ) {}

  // 약속 시간이 두 시간 이내인 경우 알림
  // @Cron('*/5 * * * * *') 
  async handleCron() {
    const plans = await this.planRepository.find({
      relations: ['author', 'couple', 'couple.users'],
    });

    for (const plan of plans) {
      const now = new Date();
      const planTime = new Date(plan.time);
      const hoursDiff = (planTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // console.log(plan);
      // 약속 시간이 두 시간 이내인 경우 알림
      if (hoursDiff <= 2 && hoursDiff > 0) {
        // console.log(hoursDiff);
        const users = plan.couple?.users || [];
        // console.log(users);
        users.forEach((user) => {
          this.notificationService.sendNotification(user.id, 'coupleMatched');

        });
      }
    }
  }
}
