import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entity/chat-room.entity';
import { Chat } from './entity/chat.entity';
import { User } from 'src/user/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Chat, ChatRoom])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
