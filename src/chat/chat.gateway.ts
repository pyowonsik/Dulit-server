import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsTransactionInterceptor } from 'src/common/interceptor/ws-transaction.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { WsQueryRunner } from 'src/common/decorator/ws-query-runner.decorator';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({
  namespace: '/chat',
  // cors: {
  //   origin: 'http://localhost:3000', // 허용할 출처
  // },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  handleDisconnect(client: Socket) {
    // console.log('ChatRoom Disconnect!!!');
    const user = client.data.user;

    if (user) {
      this.chatService.removeClient(user.sub);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken = client.handshake.query.token as string;

      const payload = await this.authService.parserBearerToken(rawToken, false);

      if (payload) {
        client.data.user = payload;
        this.chatService.registerClient(payload.sub, client);
        await this.chatService.joinUserRooms(payload, client);
      } else {
        client.disconnect();
      }
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  @UseInterceptors(WsTransactionInterceptor) // transaction이 정상적이면 commit, 아니면 rollback
  async handleMessage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    const payload = client.data.user;
    await this.chatService.createMessage(payload, body, qr);
  }
}
