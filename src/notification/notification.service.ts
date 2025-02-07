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

  // 알림을 특정 유저에게 전송하는 메서드
  async sendNotification(userId: number, message: string) {
    const client = this.connectedClients.get(userId); // 유저의 소켓 연결을 찾기
    if (client) {
      client.emit('sendNotification', message); // 해당 유저에게 알림 전송
    } else {
      console.log(`User ${userId} not connected`);
    }
  }
}
