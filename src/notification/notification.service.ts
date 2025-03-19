import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class NotificationService {
  private readonly connectedClients = new Map<number, Socket>();

  constructor() {}

  registerClient(userId: number, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: number) {
    this.connectedClients.delete(userId);
  }

  async matchedNotification(userId: number) {
    const client = this.connectedClients.get(userId);

    if (client) {
      // console.log('커플이 연결 되었습니다');
      // console.log(userId);
      client.emit('matchedNotification', '커플이 연결 되었습니다.');
    } else {
      // console.log(`User ${userId} not connected`);
    }
  }

  async sendNotification(userId: number, message: string) {
    const client = this.connectedClients.get(userId);

    if (client) {
      client.emit('sendNotification', message);
    } else {
      // console.log(`User ${userId} not connected`);
    }
  }
}
