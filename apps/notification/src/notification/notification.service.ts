import { Controller, Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  async matchedNotification(userId: string) {
    const client = this.connectedClients.get(userId);

    if (client) {
      console.log('matchedNotification', '커플이 연결 되었습니다.');
      client.emit('matchedNotification', '커플이 연결 되었습니다.');
    } else {
      console.log(`User ${userId} is not connected.`);
    }
  }
}
