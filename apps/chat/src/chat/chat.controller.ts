import {
  Controller,
  Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({
    cmd: 'create_chat_room',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createChatRoom(@Payload() data: CreateChatRoomDto) {
    return this.chatService.createChatRoom(data);
  }
}
