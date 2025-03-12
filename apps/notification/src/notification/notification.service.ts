import { Controller, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { CreateCoupleNotificationDto } from './dto/create-couple-notification.dto';

@Injectable()
export class NotificationService {
  constructor() // private readonly notificationModel: Model<Notification>, // @InjectModel(Notification.name)
  {}
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
      // const notification = await this.notificationModel.create({
      //   userId: dto.userId,
      //   message: dto.isConnect
      //     ? '커플이 연결 되었습니다.'
      //     : '커플 연결이 해제 되었습니다.',
      // });

      client.emit(
        'matchedNotification',
        dto.isConnect
          ? '커플이 연결 되었습니다.'
          : '커플 연결이 해제 되었습니다.',
      );

      /**  커플 해제시 소켓 close */
      if (!dto.isConnect) {
        // this.notificationModel.deleteMany({ userId : dto.userId }),
        client.disconnect();
        this.removeClient(dto.userId);
      }
    } else {
    }
  }
}
