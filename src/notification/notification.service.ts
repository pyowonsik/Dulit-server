import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Couple } from 'src/user/entity/couple.entity';
import { In, Repository } from 'typeorm';

type NotificationType = 'coupleMatched' | 'dateReminder';

const notificationMessages: Record<NotificationType, string> = {
  coupleMatched: '커플이 매칭 되었습니다.',
  dateReminder: '데이트 약속 2시간 전입니다!',
};

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

  async sendNotification(userId: number, type: NotificationType) {
    const client = this.connectedClients.get(userId);

    if (client) {
      console.log(notificationMessages[type]);

      client.emit('sendNotification', notificationMessages[type]);
    } else {
      console.log(`User ${userId} not connected`);
    }
  }

  // // 알림을 특정 유저에게 전송하는 메서드
  // async sendCoupleConnected(
  //   userId: number,
  //   // partnerId: number,
  //   message: string,
  // ) {

  //   const client = this.connectedClients.get(userId); // 유저의 소켓 연결을 찾기

  //   if (client) {
  //     client.emit('coupleConnected', message); // 해당 유저에게 알림 전송
  //   } else {
  //     console.log(`User ${userId} not connected`);
  //   }
  //   // console.log(this.connectedClients);
  //   // if (userClient) {
  //   //   console.log('coupleConnected');
  //   //   userClient.emit('coupleConnected', message); // 해당 유저에게 알림 전송
  //   // }
  //   // if (partnerClient) {
  //   //   console.log('coupleConnected');
  //   //   partnerClient.emit('coupleConnected', message); // 해당 유저에게 알림 전송
  //   // }
  //   // else {
  //   //   console.log(`User ${userId} not connected`);
  //   // }
  // }
}
