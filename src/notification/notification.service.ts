import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Couple } from 'src/user/entity/couple.entity';
import { In, Repository } from 'typeorm';

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
      client.emit('matchedNotification', '커플이 연결 되었습니다.');
    } else {
      console.log(`User ${userId} not connected`);
    }
  }
  
  async sendNotification(userId: number, message : string) {
    const client = this.connectedClients.get(userId);

    if (client) {
      client.emit('sendNotification', message);
    } else {
      console.log(`User ${userId} not connected`);
    }
  }
}
