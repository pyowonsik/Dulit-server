import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  namespace: '/notification',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: Socket) {
    const user = client.data.user;

    console.log('==================== DISCONNECT ====================');
    console.log('🔌 사용자:', user?.sub);
    console.log('📍 소켓 ID:', client.id);
    console.log('⏰ 시간:', new Date().toISOString());

    if (user) {
      this.notificationService.removeClient(user.sub);
      console.log('✅ Map에서 제거 완료');
    }
    console.log('====================================================');
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken = client.handshake.query.token as string;
      const payload = await this.authService.parserBearerToken(rawToken, false);
      // console.log('Notification Connect', payload?.sub);

      if (payload) {
        client.data.user = payload;
        this.notificationService.registerClient(payload.sub, client);
      } else {
        client.disconnect();
        // console.log('Client disconnected due to missing payload');
      }
    } catch (e) {
      console.log('disConnection error', e.message);
      client.disconnect();
    }
  }
}
