import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern({ cmd: 'matched_notification' })
  @UseInterceptors(RpcInterceptor)
  handleMatchedNotification(@Payload() data: { userId: string }) {
    // console.log(`NotificationController : ${data}`);
    return this.notificationService.matchedNotification(data.userId);
  }
}
