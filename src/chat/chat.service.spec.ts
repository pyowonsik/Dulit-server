import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatRoom } from './entity/chat-room.entity';
import { Chat } from './entity/chat.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { QueryRunner } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { plainToClass } from 'class-transformer';

describe('ChatService', () => {
  let chatService: ChatService;
  let chatRoomRepository: Repository<ChatRoom>;
  let chatRepository: Repository<Chat>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(ChatRoom),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Chat),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    chatRoomRepository = module.get<Repository<ChatRoom>>(
      getRepositoryToken(ChatRoom),
    );
    chatRepository = module.get<Repository<Chat>>(getRepositoryToken(Chat));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('registerClient', () => {
    it('should register a client', () => {
      const mockClient = {} as Socket;
      chatService.registerClient(1, mockClient);
      expect(chatService['connectedClients'].get(1)).toBe(mockClient);
    });
  });

  describe('removeClient', () => {
    it('should remove a client', () => {
      const mockClient = {} as Socket;
      chatService.registerClient(1, mockClient);
      chatService.removeClient(1);
      expect(chatService['connectedClients'].get(1)).toBeUndefined();
    });
  });

  describe('joinUserRooms', () => {
    it('should join user rooms', async () => {
      const mockClient = {
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as Socket;

      const mockRooms = [{ id: 1 }, { id: 2 }] as ChatRoom[];
      jest.spyOn(chatService, 'findMyChatRoom').mockResolvedValue(mockRooms);

      await chatService.joinUserRooms({ sub: 1 }, mockClient);

      expect(mockClient.join).toHaveBeenCalledWith('1');
      expect(mockClient.join).toHaveBeenCalledWith('2');
    });

    it('should emit error if no chat rooms', async () => {
      const mockClient = {
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as Socket;

      jest.spyOn(chatService, 'findMyChatRoom').mockResolvedValue([]);

      await chatService.joinUserRooms({ sub: 1 }, mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: '커플이 매칭 되지 않은 사용자입니다.',
      });
    });
  });

  describe('createMessage', () => {
    it('should create and emit a message', async () => {
      const mockClient = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as Socket;

      const mockQueryRunner = {
        manager: {
          save: jest.fn(),
        },
      } as unknown as QueryRunner;

      const mockUser = { id: 1 } as User;
      const mockChatRoom = { id: 1 } as ChatRoom;
      const mockChat = {
        id: 1,
        message: 'test',
        author: mockUser,
        chatRoom: mockChatRoom,
      } as Chat;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(chatService, 'findMyChatAndChatRoom')
        .mockResolvedValue(mockChatRoom);
      jest.spyOn(mockQueryRunner.manager, 'save').mockResolvedValue(mockChat);

      chatService['connectedClients'].set(1, mockClient);

      const message = await chatService.createMessage(
        { sub: 1 },
        { message: 'test', room: 1 },
        mockQueryRunner,
      );

      expect(message).toBe('test');
      expect(mockClient.to).toHaveBeenCalledWith('1');
      expect(mockClient.emit).toHaveBeenCalledWith(
        'sendMessage',
        plainToClass(Chat, mockChat),
      );
    });
  });
});
