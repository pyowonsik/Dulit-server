import { Controller, Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCoupleNotificationDto } from 'apps/dulit/src/notification/dto/create-couple-notificaiton.dto';
import { Socket } from 'socket.io';

@Injectable()
export class NotificationService {
  private readonly connectedClients = new Map<string, Socket>();

  registerClient(userId: string, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: string) {
    this.connectedClients.delete(userId);
  }

  /** 커플 매칭 알림 */
  async matchedNotification(dto: CreateCoupleNotificationDto) {
    const client = this.connectedClients.get(dto.userId);

    if (client) {
      client.emit('matchedNotification', dto.isConnect ? '커플이 연결 되었습니다.' : '커플 연결이 해제 되었습니다.' );
    } else {
    }
  }
}
