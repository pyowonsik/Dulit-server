import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  namespace: '/notification',
  // cors: {
  //   origin: 'http://localhost:3000', // 허용할 출처
  // },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: Socket) {
    // console.log('Notification Disconnect!!!');
    const user = client.data.user;
    console.log('Notification Connect', user);

    if (user) {
      this.notificationService.removeClient(user.sub);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken = client.handshake.query.token as string;
      // const rawToken = client.handshake.he
      // aders.authorization;

      const payload = await this.authService.parserBearerToken(rawToken, false);
      console.log('Notification Connect', payload.sub);

      if (payload) {
        client.data.user = payload;
        this.notificationService.registerClient(payload.sub, client);
      } else {
        client.disconnect();
      }
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }
}
