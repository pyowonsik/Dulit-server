import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { In, Repository } from 'typeorm';
import { CreateCoupleNotificationDto } from './dto/create-couple-notificaiton.dto';

@Injectable()
export class NotificationService {
  private readonly connectedClients = new Map<string, Socket>();

  constructor() {}

  registerClient(userId: string, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: string) {
    this.connectedClients.delete(userId);
  }

  async matchedNotification(dto: CreateCoupleNotificationDto) {
    const client = this.connectedClients.get(dto.userId);

    if (client) {
      // console.log('커플이 연결 되었습니다');
      // console.log(userId);
      client.emit('matchedNotification', '커플이 연결 되었습니다.');
    } else {
      // console.log(`User ${userId} not connected`);
    }
  }

  // async sendNotification(userId: number, message: string) {
  //   const client = this.connectedClients.get(userId);

  //   console.log()

  //   if (client) {
  //     client.emit('sendNotification', message);
  //   } else {
  //     // console.log(`User ${userId} not connected`);
  //   }
  // }
}
