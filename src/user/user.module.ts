import { Module, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Couple } from './entity/couple.entity';
import { Chat } from 'src/chat/entity/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatRoom, Couple, Post, Chat])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
