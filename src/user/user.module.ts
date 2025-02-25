import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { Post } from 'src/post/entity/post.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Couple } from 'src/couple/entity/couple.entity';
import { Anniversary } from 'src/couple/anniversary/entity/anniversary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatRoom, Couple, Post, Chat, Anniversary]),
    NotificationModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
