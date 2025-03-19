import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Plan } from 'src/couple/plan/entities/plan.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly notificationService: NotificationService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService, // winston logger
  ) {}

  // Cron을 사용해 로그 찍기
  // @Cron('*/5 * * * * *')
  logEverySeconds() {
    this.logger.fatal('fatal 레벨 로그', null, TaskService.name);
    this.logger.error('error 레벨 로그', null, TaskService.name);
    this.logger.warn('warn 레벨 로그', TaskService.name);
    this.logger.log('log 레벨 로그', TaskService.name);
    this.logger.debug('debug 레벨 로그', TaskService.name);
    this.logger.verbose('verbose 레벨 로그', TaskService.name);
  }

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
        const users = plan.couple?.users || [];
        users.forEach((user) => {
          this.notificationService.sendNotification(
            user.id,
            '약속 시간까지 2시간 남았습니다!',
          );
        });
      }
    }
  }
}
