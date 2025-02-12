import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Couple } from './entity/couple.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { Post } from 'src/post/entity/post.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Anniversary } from 'src/anniversary/entity/anniversary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatRoom, Couple, Post, Chat,Anniversary]),
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
