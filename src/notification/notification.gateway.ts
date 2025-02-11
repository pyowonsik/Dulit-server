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

@WebSocketGateway()
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

    if (user) {
      this.notificationService.removeClient(user.sub);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken = client.handshake.headers.authorization;

      const payload = await this.authService.parserBearerToken(rawToken, false);

      if (payload) {
        console.log('Notification Connection!!!');
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
