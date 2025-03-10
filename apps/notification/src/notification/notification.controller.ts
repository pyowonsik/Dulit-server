import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { CreateCoupleNotificationDto } from 'apps/dulit/src/notification/dto/create-couple-notificaiton.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern({ cmd: 'matched_notification' })
  @UseInterceptors(RpcInterceptor)
  matchedNotification(@Payload() data: CreateCoupleNotificationDto) {
    return this.notificationService.matchedNotification(data);
  }
}
