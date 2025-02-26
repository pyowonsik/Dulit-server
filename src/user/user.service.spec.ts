import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { SocialProvider, User } from './entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { QueryRunner } from 'typeorm';
import { Chat } from 'src/chat/entity/chat.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Couple } from 'src/couple/entity/couple.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { Plan } from 'src/couple/plan/entities/plan.entity';
import { Post } from 'src/post/entity/post.entity';
import { Anniversary } from 'src/couple/anniversary/entity/anniversary.entity';
import { Calendar } from 'src/couple/calendar/entities/calendar.entity';

// 명시적 mock 테스트

const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockAuthService = {
  issueToken: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  // create
  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@codefactory.ai',
        password: '123123',
        name: '홍길동',
        socialProvider: SocialProvider.common,
        socialId: '123456',
      };
      const hashRounds = 10;
      const hashedPassword = 'hashhashhash';
      const result = {
        id: 1,
        email: createUserDto.email,
        password: createUserDto.password,
      };

      // ---------- jest.spyOn : mock method의 반환값 설정 ----------
      // mockResolvedValue와 mockReturnValue의 차이 : async , sync
      // mockResolvedValueOnce : 해당 method가 여러번 호출되면 반환값을 다르게 설정하기 위함.

      // mockUserRepository.findOne()를 감시하고, 반환값을 한번만 null로 설정
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(null);
      // mockConfigService.get()를 감시하고, 반환값을 hashRounds(10)로 설정
      jest.spyOn(mockConfigService, 'get').mockReturnValue(hashRounds);
      // bcrypt.hash(password,hashRounds)를 감시하고,반환값을 hashedPassword로 설정
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((password, hashRounds) => hashedPassword);
      // mockUserRepository.findOne()를 다시 감시하고,반환값을 한번만 result로 설정
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(result);
      //

      // create를 테스트하기 위한것이니 create가 정상적으로 동작되었는지 확인을 위해 create의 반환값 저장 후,
      // 반환값이 맞는지 expect
      const createdUser = await userService.create(createUserDto);
      expect(createdUser).toEqual(result);
      //

      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          email: createUserDto.email,
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          email: createUserDto.email,
        },
      });
      expect(mockConfigService.get).toHaveBeenCalledWith(expect.anything());
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        hashRounds,
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        socialId: createUserDto.socialId,
        socialProvider: createUserDto.socialProvider,
      });
    });

    it('should throw BadRequestException if email already exists', () => {
      const createUserDto: CreateUserDto = {
        email: 'test@codefactory.ai',
        password: '123123',
        name: '홍길동',
        socialProvider: SocialProvider.common,
        socialId: '123456',
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });

      // rejects,resolves -> promise
      // BadRequestException 테스트
      expect(userService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createUserDto.email,
        },
      });
    });
  });
  //

  // socialJoinAndLogin
  describe('socialJoinAndLogin', () => {
    it('should create a new user and return accessToken, refreshToken, and user when user does not exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@codefactory.ai',
        password: '123123',
        name: '홍길동',
        socialProvider: SocialProvider.common,
        socialId: '123456',
      };

      const user = {
        id: 1,
        email: createUserDto.email,
        password: createUserDto.password,
        socialId: createUserDto.socialId,
        socialProvider: createUserDto.socialProvider,
      };

      const accessToken = 'access-token-example';
      const refreshToken = 'refresh-token-example';

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null); // 기존 유저 없음
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(user); // 새 유저 생성
      jest
        .spyOn(mockAuthService, 'issueToken')
        .mockResolvedValueOnce(accessToken); // 첫 번째 호출 (accessToken)
      jest
        .spyOn(mockAuthService, 'issueToken')
        .mockResolvedValueOnce(refreshToken); // 두 번째 호출 (refreshToken)

      const result = await userService.socialJoinAndLogin(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { socialId: createUserDto.socialId },
      });

      expect(mockUserRepository.save).toHaveBeenCalledWith({
        socialId: createUserDto.socialId,
        email: createUserDto.email,
        name: createUserDto.name,
        socialProvider: createUserDto.socialProvider,
      });

      expect(mockAuthService.issueToken).toHaveBeenCalledTimes(2);
      expect(mockAuthService.issueToken).toHaveBeenCalledWith(user, false); // accessToken
      expect(mockAuthService.issueToken).toHaveBeenCalledWith(user, true); // refreshToken

      expect(result).toEqual({
        accessToken,
        refreshToken,
        user,
      });
    });
  });
  //

  // findAll
  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        {
          id: 1,
          email: 'test@test.com',
        },
      ];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });
  //

  // findOne
  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.findOne(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });
    // NotFoundException
    it('should throw NotFoundException if user is not found ', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });
  });
  //

  // findPartnerById
  describe('findPartnerById', () => {
    it('should return a user by socialId', async () => {
      const partnerId = 123;

      const user = {
        name: 'Test User',
        email: 'testuser@test.com',
        socialId: partnerId.toString(),
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.findPartnerById(partnerId);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          socialId: partnerId.toString(),
        },
        select: ['name', 'email', 'socialId'],
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const partnerId = 999;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.findPartnerById(partnerId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          socialId: partnerId.toString(),
        },
        select: ['name', 'email', 'socialId'],
      });
    });
  });
  //

  // remove
  describe('remove', () => {
    let qr: jest.Mocked<QueryRunner>;
    let deleteChatRoomsAndChatsMock: jest.SpyInstance;
    let deleteCoupleAndRelatedDataMock: jest.SpyInstance;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          delete: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;

      deleteChatRoomsAndChatsMock = jest
        .spyOn(userService, 'deleteChatRoomsAndChats')
        .mockResolvedValue(undefined);
      deleteCoupleAndRelatedDataMock = jest
        .spyOn(userService, 'deleteCoupleAndRelatedData')
        .mockResolvedValue(undefined);
    });

    it('should delete user successfully', async () => {
      // Given: Mocking user data
      const mockUser = { id: 1, chatRooms: [], couple: null };
      (qr.manager.findOne as jest.Mock).mockResolvedValue(mockUser);

      // When: remove method is called
      await userService.remove(1, qr);

      // Then: Expect related functions to be called
      expect(deleteChatRoomsAndChatsMock).toHaveBeenCalledWith(mockUser, qr);
      expect(deleteCoupleAndRelatedDataMock).toHaveBeenCalledWith(mockUser, qr);
      expect(qr.manager.delete).toHaveBeenCalledWith(User, 1);
    });

    it('should throw an error if user does not exist', async () => {
      // Given: Simulating user not found
      (qr.manager.findOne as jest.Mock).mockResolvedValue(null);

      // When / Then: Expect remove() to throw NotFoundException
      await expect(userService.remove(1, qr)).rejects.toThrow(
        '존재하지 않는 유저의 ID 입니다.',
      );
    });

    it('should throw an error if deleteChatRoomsAndChats fails', async () => {
      // Given: Simulating an error in deleteChatRoomsAndChats
      (qr.manager.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        chatRooms: [],
        couple: null,
      });
      deleteChatRoomsAndChatsMock.mockRejectedValue(new Error('Mocked Error'));

      // When / Then: Expect remove() to throw an error
      await expect(userService.remove(1, qr)).rejects.toThrow('Mocked Error');
    });
  });
  //

  // deleteChatRoomsAndChats
  describe('deleteChatRoomsAndChats', () => {
    let qr: jest.Mocked<QueryRunner>;
 
    beforeEach(() => {
      qr = {
        manager: {
          delete: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
    });

    it('should delete chatRooms And Chats successfully', async () => {
      // Given: Mocking user data

      // When: remove method is called

      // Then: Expect related functions to be called
    });
  });
  //

   // deleteChatRoomsAndChats
   describe('deleteChatRoomsAndChats', () => {
    let qr: jest.Mocked<QueryRunner>;
  
    beforeEach(() => {
      qr = {
        manager: {
          delete: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
    });
  
    it('should delete chat and chatRoom if user has chatRooms', async () => {
      const user = {
        chatRooms: [
          {
            id: 1,
            // chatRoom에 필요한 데이터 추가
          },
        ],
      } as User;
  
      // 메서드 직접 호출
      await userService.deleteChatRoomsAndChats(user, qr);
  
      // qr.manager.delete가 두 번 호출되었는지 확인
      expect(qr.manager.delete).toHaveBeenCalledTimes(2);
  
      // 첫 번째 호출은 Chat에 대한 삭제
      expect(qr.manager.delete).toHaveBeenCalledWith(Chat, {
        chatRoom: user.chatRooms[0],
      });
  
      // 두 번째 호출은 ChatRoom에 대한 삭제
      expect(qr.manager.delete).toHaveBeenCalledWith(ChatRoom, user.chatRooms[0].id);
    });
  
    it('should not delete chat and chatRoom if user has no chatRooms', async () => {
      const user = {
        chatRooms: [], // 채팅방이 없을 경우
      } as User;
  
      // 메서드 직접 호출
      await userService.deleteChatRoomsAndChats(user, qr);
  
      // delete가 호출되지 않았는지 확인
      expect(qr.manager.delete).not.toHaveBeenCalled();
    });
  });
  //

  // deleteCoupleAndRelatedData
  describe('deleteCoupleAndRelatedData', () => {
    let qr: jest.Mocked<QueryRunner>;
  
    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
  
    });
  
    it('should delete couple and related data if user has a couple', async () => {
      const user = { couple: { id: 1 } } as User;
      const couple = { id: 1, users: [{ id: 1 }, { id: 2 }] } as Couple;
  
      jest.spyOn(qr.manager, 'findOne').mockResolvedValue(couple);
  
      await userService.deleteCoupleAndRelatedData(user, qr);
  
      expect(qr.manager.update).toHaveBeenCalledTimes(2);
      expect(qr.manager.update).toHaveBeenCalledWith(User, 1, { couple: null });
      expect(qr.manager.update).toHaveBeenCalledWith(User, 2, { couple: null });
  
      expect(qr.manager.delete).toHaveBeenCalledTimes(7);
      expect(qr.manager.delete).toHaveBeenCalledWith(CommentModel, { author: { id: 1 } });
      expect(qr.manager.delete).toHaveBeenCalledWith(CommentModel, { author: { id: 2 } });
      expect(qr.manager.delete).toHaveBeenCalledWith(Plan, { couple: user.couple });
      expect(qr.manager.delete).toHaveBeenCalledWith(Post, { couple: user.couple });
      expect(qr.manager.delete).toHaveBeenCalledWith(Anniversary, { couple: user.couple });
      expect(qr.manager.delete).toHaveBeenCalledWith(Calendar, { couple: user.couple });
      expect(qr.manager.delete).toHaveBeenCalledWith(Couple, user.couple.id);
    });
  
    it('should not delete anything if user has no couple', async () => {
      await userService.deleteCoupleAndRelatedData({} as User, qr);
  
      expect(qr.manager.delete).not.toHaveBeenCalled();
      expect(qr.manager.update).not.toHaveBeenCalled();
    });
  });  
  // 
});
