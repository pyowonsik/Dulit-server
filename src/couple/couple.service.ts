import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { QueryRunner } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Couple } from './entity/couple.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { Post } from 'src/post/entity/post.entity';
import { Plan } from './plan/entities/plan.entity';
import { Anniversary } from './anniversary/entity/anniversary.entity';
import { Calendar } from './calendar/entities/calendar.entity';

@Injectable()
export class CoupleService {
  constructor(private readonly notificationService: NotificationService) {}
  async connectCouple(createCoupleDto: CreateCoupleDto, qr: QueryRunner) {
    const me = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.myId },
      relations: ['couple'],
    });
    const partner = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.partnerId },
      relations: ['couple'],
    });

    if (me.socialId === partner.socialId) {
      throw new BadRequestException('상대방의 socialId를 입력하세요.');
    }

    if (!me || !partner)
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    if (me.couple || partner.couple)
      throw new BadRequestException('이미 매칭된 사용자입니다.');

    // 명시적 엔티티 생성 -> .save()는 객체 전체를 업데이트 하기 때문에 .create()후 .save() 권장
    const newChatRoom = qr.manager.create(ChatRoom, {
      users: [me, partner],
    });
    await qr.manager.save(newChatRoom);

    const newCouple = qr.manager.create(Couple, {
      users: [me, partner],
      chatRoom: newChatRoom,
    });
    await qr.manager.save(newCouple);

    this.notificationService.matchedNotification(me.id);
    this.notificationService.matchedNotification(partner.id);

    // 쿼리 최적화
    // const user = await qr.manager.findOne(User, {
    //   where: { socialId: createCoupleDto.myId },
    //   relations: ['couple', 'chatRooms'],
    // });

    return true;
  }

  async disConnectCouple(createCoupleDto: CreateCoupleDto, qr: QueryRunner) {
    const me = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.myId },
      relations: ['couple', 'chatRooms'],
    });
    const partner = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.partnerId },
      relations: ['couple'],
    });

    if (me.socialId === partner.socialId) {
      throw new BadRequestException('상대방의 socialId를 입력하세요.');
    }

    if (!me || !partner)
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    if (!me.couple || !partner.couple)
      throw new BadRequestException('매칭이 되지 않은 사용자입니다.');

    // 1. 유저가 속한 chatRoom - chat 삭제
    await this.deleteChatRoomsAndChats(me, qr);

    // // 2. 유저가 속한 couple - plan , post 삭제
    await this.deleteCoupleAndRelatedData(me, qr);

    this.notificationService.sendNotification(
      me.id,
      '커플 연결이 해제되었습니다.',
    );
    this.notificationService.sendNotification(
      partner.id,
      '커플 연결이 해제되었습니다.',
    );

    return me.id;
  }

  async deleteChatRoomsAndChats(user: User, qr: QueryRunner) {
    if (user.chatRooms.length > 0) {
      await qr.manager.delete(Chat, {
        chatRoom: user.chatRooms[0],
      });
      await qr.manager.delete(ChatRoom, user.chatRooms[0].id);
    }
  }

  async deleteCoupleAndRelatedData(user: User, qr: QueryRunner) {
    if (user.couple) {
      const couple = await qr.manager.findOne(Couple, {
        where: { id: user.couple.id },
        relations: ['users'],
      });

      if (couple?.users) {
        await Promise.all(
          couple.users.map(async (user) => {
            await qr.manager.update(User, user.id, { couple: null });
            await qr.manager.delete(CommentModel, { author: user });
          }),
        );

        await qr.manager.delete(Plan, { couple: user.couple });
        await qr.manager.delete(Post, { couple: user.couple });
        await qr.manager.delete(Anniversary, { couple: user.couple });
        await qr.manager.delete(Calendar, { couple: user.couple });
        await qr.manager.delete(Couple, couple.id);
      }
    }
  }
}
