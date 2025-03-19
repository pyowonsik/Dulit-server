import { TestBed } from '@automock/jest';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let notificationService: jest.Mocked<NotificationService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(NotificationGateway).compile();

    gateway = unit;
    notificationService = unitRef.get(NotificationService);
    authService = unitRef.get(AuthService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should register client on valid token', async () => {
      const mockClient = {
        handshake: { query: { token: 'valid_token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      authService.parserBearerToken.mockResolvedValue({ sub: 1 });

      await gateway.handleConnection(mockClient);

      expect(authService.parserBearerToken).toHaveBeenCalledWith(
        'valid_token',
        false,
      );
      expect(notificationService.registerClient).toHaveBeenCalledWith(
        1,
        mockClient,
      );
      expect(mockClient.data.user).toEqual({ sub: 1 });
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client on invalid token', async () => {
      const mockClient = {
        handshake: { query: { token: 'invalid_token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      authService.parserBearerToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await gateway.handleConnection(mockClient);

      expect(authService.parserBearerToken).toHaveBeenCalledWith(
        'invalid_token',
        false,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'disConnection error',
        'Invalid token',
      );

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if payload is missing', async () => {
      const mockClient = {
        handshake: { query: { token: 'valid_token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      authService.parserBearerToken.mockResolvedValue(null); // null payload to trigger else block

      await gateway.handleConnection(mockClient);

      expect(authService.parserBearerToken).toHaveBeenCalledWith(
        'valid_token',
        false,
      );
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client on disconnect', () => {
      const mockClient = {
        data: { user: { sub: 1 } },
      } as unknown as Socket;

      gateway.handleDisconnect(mockClient);

      expect(notificationService.removeClient).toHaveBeenCalledWith(1);
    });

    it('should not remove client if no user data', () => {
      const mockClient = {
        data: {},
      } as unknown as Socket;

      gateway.handleDisconnect(mockClient);

      expect(notificationService.removeClient).not.toHaveBeenCalled();
    });
  });
});
