import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices';
import { USER_SERVICE } from '@app/common';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawToken = client.handshake.headers.authorization;

      // user_service 메세지 패턴으로 send 해야함.
      const { data: payload } = await lastValueFrom(
        this.userService.send(
          { cmd: 'parse_bearer_token' },
          { token: rawToken },
        ),
      );

      if (payload) {
        client.data.user = payload;
        this.chatService.registerClient(payload.sub, client);
        await this.chatService.joinUserRooms(payload, client);
        console.log(`User ${payload.sub} connected to Chat WebSocket`);
      } else {
        client.disconnect();
        console.log('Client disconnected due to missing payload');
      }
    } catch (e) {
      client.disconnect();
      console.log('Client disconnected due to invalid token');
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.chatService.removeClient(user.sub);
      console.log(`User ${user.sub} disconnected from Chat WebSocket`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const payload = client.data.user;
    await this.chatService.sendMessage(payload, body);
  }
}
