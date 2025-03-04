import { TestBed } from '@automock/jest';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryRunner } from 'typeorm';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: jest.Mocked<ChatService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(ChatGateway).compile();

    gateway = unit;
    chatService = unitRef.get(ChatService);
    authService = unitRef.get(AuthService);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should register client and join rooms on valid token', async () => {
      const mockClient = {
        handshake: { query: { token: 'valid_token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      authService.parserBearerToken.mockResolvedValue({ sub: 1 });

      chatService.registerClient.mockImplementation(() => {});
      chatService.joinUserRooms.mockImplementation(() => Promise.resolve());

      await gateway.handleConnection(mockClient);

      expect(authService.parserBearerToken).toHaveBeenCalledWith(
        'valid_token',
        false,
      );
      expect(chatService.registerClient).toHaveBeenCalledWith(1, mockClient);
      expect(chatService.joinUserRooms).toHaveBeenCalledWith(
        { sub: 1 },
        mockClient,
      );
      expect(mockClient.data.user).toEqual({ sub: 1 });
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client on invalid token', async () => {
      const mockClient = {
        handshake: { query: { token: 'invalid_token' } },
        disconnect: jest.fn(),
      } as unknown as Socket;

      authService.parserBearerToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await gateway.handleConnection(mockClient);

      expect(authService.parserBearerToken).toHaveBeenCalledWith(
        'invalid_token',
        false,
      );
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if no payload', async () => {
      const mockClient = {
        handshake: { query: { token: 'no_payload_token' } },
        data: {},
        disconnect: jest.fn(),
      } as unknown as Socket;

      authService.parserBearerToken.mockResolvedValue(null);

      await gateway.handleConnection(mockClient);

      expect(authService.parserBearerToken).toHaveBeenCalledWith(
        'no_payload_token',
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

      chatService.removeClient.mockImplementation(() => {});

      gateway.handleDisconnect(mockClient);

      expect(chatService.removeClient).toHaveBeenCalledWith(1);
    });
  });

  describe('handleMessage', () => {
    it('should create a message', async () => {
      const mockClient = {
        data: { user: { sub: 1 } },
      } as unknown as Socket;

      const mockQueryRunner = {} as QueryRunner;
      const mockDto: CreateChatDto = { message: 'test message', room: 1 };

      chatService.createMessage.mockResolvedValue('test message');

      await gateway.handleMessage(mockDto, mockClient, mockQueryRunner);

      expect(chatService.createMessage).toHaveBeenCalledWith(
        { sub: 1 },
        mockDto,
        mockQueryRunner,
      );
    });
  });
});
