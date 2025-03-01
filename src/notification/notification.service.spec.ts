import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { Socket } from 'socket.io';

const mockSocket = {
  emit: jest.fn(),
};

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(notificationService).toBeDefined();
  });

  describe('registerClient', () => {
    it('should register a client', () => {
      const userId = 1;
      notificationService.registerClient(
        userId,
        mockSocket as unknown as Socket,
      );
      expect(notificationService['connectedClients'].get(userId)).toBe(
        mockSocket,
      );
    });
  });

  describe('removeClient', () => {
    it('should remove a client', () => {
      const userId = 1;
      notificationService.registerClient(
        userId,
        mockSocket as unknown as Socket,
      );
      notificationService.removeClient(userId);
      expect(
        notificationService['connectedClients'].get(userId),
      ).toBeUndefined();
    });
  });

  describe('matchedNotification', () => {
    it('should send a matched notification if client is connected', async () => {
      const userId = 1;
      notificationService.registerClient(
        userId,
        mockSocket as unknown as Socket,
      );
      await notificationService.matchedNotification(userId);
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'matchedNotification',
        '커플이 연결 되었습니다.',
      );
    });

    it('should log if client is not connected', async () => {
      const userId = 2;
      await notificationService.matchedNotification(userId);
    });
  });

  describe('sendNotification', () => {
    it('should send a notification if client is connected', async () => {
      const userId = 1;
      const message = 'Test message';
      notificationService.registerClient(
        userId,
        mockSocket as unknown as Socket,
      );
      await notificationService.sendNotification(userId, message);
      expect(mockSocket.emit).toHaveBeenCalledWith('sendNotification', message);
    });

    it('should log if client is not connected', async () => {
      const userId = 2;
      const message = 'Test message';
      await notificationService.sendNotification(userId, message);
    });
  });
});
