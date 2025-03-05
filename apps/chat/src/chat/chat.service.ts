import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './schema/chat-room.schema';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatroomModel: Model<ChatRoom>,
  ) {}

  private readonly connectedClients = new Map<string, Socket>();

  registerClient(userId: string, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: string) {
    this.connectedClients.delete(userId);
  }

  async createChatRoom(dto: CreateChatRoomDto) {
    const chatroom = await this.chatroomModel.create({
      user1Id: dto.user1Id,
      user2Id: dto.user2Id,
      coupleId: dto.coupleId,
    });

    return chatroom;
  }

  async joinUserRooms(user: { sub: number }, client: Socket) {
    // const chatRooms = await this.findMyChatRoom(user.sub);
    // if (chatRooms.length === 0) {
    //   client.emit('error', { message: '커플이 매칭 되지 않은 사용자입니다.' });
    //   return;
    // }
    // // socket Connect -> client(socket) chatRooms의 id 값으로 join
    // chatRooms.forEach((room) => {
    //   client.join(room.id.toString());
    // });
  }
}
