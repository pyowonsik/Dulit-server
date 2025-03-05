import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './schema/chat-room.schema';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatroomModel: Model<ChatRoom>,
  ) {}

  async createChatRoom(dto: CreateChatRoomDto) {
    const chatroom = await this.chatroomModel.create({
      user1Id: dto.user1Id,
      user2Id: dto.user2Id,
      coupleId: dto.coupleId,
    });

    return chatroom;
  }
}
