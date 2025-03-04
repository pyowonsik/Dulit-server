import { Test, TestingModule } from '@nestjs/testing';
import { CoupleService } from './couple.service';
import { NotificationService } from 'src/notification/notification.service';
import { Couple } from './entity/couple.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Calendar } from './calendar/entities/calendar.entity';
import { Anniversary } from './anniversary/entity/anniversary.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Plan } from './plan/entities/plan.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { Post } from 'src/post/entity/post.entity';

const mockNotificationService = {
  matchedNotification: jest.fn(),
  sendNotification: jest.fn(),
};

const mockCoupleRepository = {
  findOne: jest.fn(),
};

describe('CoupleService', () => {
  let coupleService: CoupleService;
  let coupleRepository: Repository<Couple>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoupleService,
        {
          provide: getRepositoryToken(Couple),
          useValue: mockCoupleRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    coupleRepository = module.get<Repository<Couple>>(
      getRepositoryToken(Couple),
    );
    coupleService = module.get<CoupleService>(CoupleService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(coupleService).toBeDefined();
  });

  describe('connectCouple', () => {
    let qr: jest.Mocked<QueryRunner>;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;
    });

    it('should connect two users as a couple', async () => {
      const createCoupleDto = {
        myId: 'mySocialId',
        partnerId: 'partnerSocialId',
      };
      const me = { socialId: 'mySocialId', couple: null } as User;
      const partner = { socialId: 'partnerSocialId', couple: null } as User;
      const newChatRoom = { id: 1, users: [me, partner] } as ChatRoom;
      const newCouple = {
        id: 1,
        users: [me, partner],
        chatRoom: newChatRoom,
      } as Couple;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(partner);
      (qr.manager.create as jest.Mock).mockReturnValueOnce(newChatRoom);
      (qr.manager.create as jest.Mock).mockReturnValueOnce(newCouple);
      (qr.manager.save as jest.Mock).mockResolvedValueOnce(newChatRoom);
      (qr.manager.save as jest.Mock).mockResolvedValueOnce(newCouple);

      const result = await coupleService.connectCouple(createCoupleDto, qr);

      expect(qr.manager.findOne).toHaveBeenCalledWith(User, {
        where: { socialId: createCoupleDto.myId },
        relations: ['couple'],
      });
      expect(qr.manager.findOne).toHaveBeenCalledWith(User, {
        where: { socialId: createCoupleDto.partnerId },
        relations: ['couple'],
      });
      expect(qr.manager.create).toHaveBeenCalledWith(ChatRoom, {
        users: [me, partner],
      });
      expect(qr.manager.save).toHaveBeenCalledWith(newChatRoom);
      expect(qr.manager.create).toHaveBeenCalledWith(Couple, {
        users: [me, partner],
        chatRoom: newChatRoom,
      });
      expect(qr.manager.save).toHaveBeenCalledWith(newCouple);
      expect(notificationService.matchedNotification).toHaveBeenCalledWith(
        me.id,
      );
      expect(notificationService.matchedNotification).toHaveBeenCalledWith(
        partner.id,
      );
      expect(result).toBe(true);
    });

    it('should throw BadRequestException if users are the same', async () => {
      const createCoupleDto = { myId: 'sameId', partnerId: 'sameId' };
      const me = { socialId: 'sameId', couple: null } as User;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);

      await expect(
        coupleService.connectCouple(createCoupleDto, qr),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if users do not exist', async () => {
      const createCoupleDto = {
        myId: 'mySocialId',
        partnerId: 'partnerSocialId',
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        coupleService.connectCouple(createCoupleDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if users are already matched', async () => {
      const createCoupleDto = {
        myId: 'mySocialId',
        partnerId: 'partnerSocialId',
      };
      const me = { socialId: 'mySocialId', couple: {} } as User;
      const partner = { socialId: 'partnerSocialId', couple: {} } as User;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(partner);

      await expect(
        coupleService.connectCouple(createCoupleDto, qr),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('disConnectCouple', () => {
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

    it('should disconnect a couple', async () => {
      const createCoupleDto = {
        myId: 'mySocialId',
        partnerId: 'partnerSocialId',
      };
      const me = {
        socialId: 'mySocialId',
        couple: { id: 1 },
        chatRooms: [{ id: 1 }],
      } as User;
      const partner = {
        socialId: 'partnerSocialId',
        couple: { id: 1 },
      } as User;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(partner);

      jest
        .spyOn(coupleService, 'deleteChatRoomsAndChats')
        .mockResolvedValue(undefined);
      jest
        .spyOn(coupleService, 'deleteCoupleAndRelatedData')
        .mockResolvedValue(undefined);

      const result = await coupleService.disConnectCouple(createCoupleDto, qr);

      expect(qr.manager.findOne).toHaveBeenCalledWith(User, {
        where: { socialId: createCoupleDto.myId },
        relations: ['couple', 'chatRooms'],
      });
      expect(qr.manager.findOne).toHaveBeenCalledWith(User, {
        where: { socialId: createCoupleDto.partnerId },
        relations: ['couple'],
      });
      expect(coupleService.deleteChatRoomsAndChats).toHaveBeenCalledWith(
        me,
        qr,
      );
      expect(coupleService.deleteCoupleAndRelatedData).toHaveBeenCalledWith(
        me,
        qr,
      );
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        me.id,
        '커플 연결이 해제되었습니다.',
      );
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        partner.id,
        '커플 연결이 해제되었습니다.',
      );
      expect(result).toBe(me.id);
    });

    it('should throw BadRequestException if users are the same', async () => {
      const createCoupleDto = { myId: 'sameId', partnerId: 'sameId' };
      const me = { socialId: 'sameId', couple: null } as User;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);

      await expect(
        coupleService.disConnectCouple(createCoupleDto, qr),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if users do not exist', async () => {
      const createCoupleDto = {
        myId: 'mySocialId',
        partnerId: 'partnerSocialId',
      };

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        coupleService.disConnectCouple(createCoupleDto, qr),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if users are not matched', async () => {
      const createCoupleDto = {
        myId: 'mySocialId',
        partnerId: 'partnerSocialId',
      };
      const me = { socialId: 'mySocialId', couple: null } as User;
      const partner = { socialId: 'partnerSocialId', couple: null } as User;

      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(me);
      (qr.manager.findOne as jest.Mock).mockResolvedValueOnce(partner);

      await expect(
        coupleService.disConnectCouple(createCoupleDto, qr),
      ).rejects.toThrow(BadRequestException);
    });
  });

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
      await coupleService.deleteChatRoomsAndChats(user, qr);

      // qr.manager.delete가 두 번 호출되었는지 확인
      expect(qr.manager.delete).toHaveBeenCalledTimes(2);

      // 첫 번째 호출은 Chat에 대한 삭제
      expect(qr.manager.delete).toHaveBeenCalledWith(Chat, {
        chatRoom: user.chatRooms[0],
      });

      // 두 번째 호출은 ChatRoom에 대한 삭제
      expect(qr.manager.delete).toHaveBeenCalledWith(
        ChatRoom,
        user.chatRooms[0].id,
      );
    });

    it('should not delete chat and chatRoom if user has no chatRooms', async () => {
      const user = {
        chatRooms: [], // 채팅방이 없을 경우
      } as User;

      // 메서드 직접 호출
      await coupleService.deleteChatRoomsAndChats(user, qr);

      // delete가 호출되지 않았는지 확인
      expect(qr.manager.delete).not.toHaveBeenCalled();
    });
  });

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

        await coupleService.deleteCoupleAndRelatedData(user, qr);

        expect(qr.manager.update).toHaveBeenCalledTimes(2);
        expect(qr.manager.update).toHaveBeenCalledWith(User, 1, {
          couple: null,
        });
        expect(qr.manager.update).toHaveBeenCalledWith(User, 2, {
          couple: null,
        });

        expect(qr.manager.delete).toHaveBeenCalledTimes(7);
        expect(qr.manager.delete).toHaveBeenCalledWith(CommentModel, {
          author: { id: 1 },
        });
        expect(qr.manager.delete).toHaveBeenCalledWith(CommentModel, {
          author: { id: 2 },
        });
        expect(qr.manager.delete).toHaveBeenCalledWith(Plan, {
          couple: { id: 1 },
        });
        expect(qr.manager.delete).toHaveBeenCalledWith(Post, {
          couple: { id: 1 },
        });
        expect(qr.manager.delete).toHaveBeenCalledWith(Anniversary, {
          couple: { id: 1 },
        });
        expect(qr.manager.delete).toHaveBeenCalledWith(Calendar, {
          couple: { id: 1 },
        });
        expect(qr.manager.delete).toHaveBeenCalledWith(Couple, 1);
      });

      it('should not delete anything if user has no couple', async () => {
        await coupleService.deleteCoupleAndRelatedData({} as User, qr);

        expect(qr.manager.delete).not.toHaveBeenCalled();
        expect(qr.manager.update).not.toHaveBeenCalled();
      });
    });
  });

  //
  describe('findCoupleRelationChild', () => {
    it('should return couple if found', async () => {
      const userId = 1;
      const relations = ['users'];
      const couple = { id: 1, users: [{ id: userId }] };

      jest
        .spyOn(coupleRepository, 'findOne')
        .mockResolvedValue(couple as Couple);

      const result = await coupleService.findCoupleRelationChild(
        userId,
        relations,
      );

      expect(result).toEqual(couple);
      expect(coupleRepository.findOne).toHaveBeenCalledWith({
        where: { users: { id: In([userId]) } },
        relations,
      });
    });

    it('should throw NotFoundException if couple is not found', async () => {
      const userId = 1;
      const relations = ['users'];

      jest.spyOn(coupleRepository, 'findOne').mockResolvedValue(null);

      await expect(
        coupleService.findCoupleRelationChild(userId, relations),
      ).rejects.toThrow(NotFoundException);
      expect(coupleRepository.findOne).toHaveBeenCalledWith({
        where: { users: { id: In([userId]) } },
        relations,
      });
    });

    it('should return couple if found without relations', async () => {
      const userId = 1;
      const couple = { id: 1, users: [{ id: userId }] };

      jest
        .spyOn(coupleRepository, 'findOne')
        .mockResolvedValue(couple as Couple);

      const result = await coupleService.findCoupleRelationChild(userId);

      expect(result).toEqual(couple);
      expect(coupleRepository.findOne).toHaveBeenCalledWith({
        where: { users: { id: In([userId]) } },
        relations: [],
      });
    });

    it('should handle unexpected errors', async () => {
      const userId = 1;
      const relations = ['users'];

      jest
        .spyOn(coupleRepository, 'findOne')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        coupleService.findCoupleRelationChild(userId, relations),
      ).rejects.toThrow('Unexpected error');
      expect(coupleRepository.findOne).toHaveBeenCalledWith({
        where: { users: { id: In([userId]) } },
        relations,
      });
    });
  });
});
