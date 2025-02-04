import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,ChatRoom])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
