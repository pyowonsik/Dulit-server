import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Couple } from './entity/couple.entity';
import { Repository, DataSource } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { CHAT_SERVICE, NOTIFICATION_SERVICE, USER_SERVICE } from '@app/common';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { Anniversary } from './anniversary/entity/anniversary.entity';
import { Plan } from './plan/entity/plan.entity';
import { Calendar } from './calendar/entity/calendar.entity';

@Injectable()
export class CoupleService {
  constructor(
    private readonly dataSource: DataSource, // DataSource 추가
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(CHAT_SERVICE)
    private readonly chatService: ClientProxy,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
  ) {}

  async connectCouple(createCoupleDto: ConnectCoupleDto) {
    const { partnerId, isConnect, meta } = createCoupleDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) 본인 정보 가져오기
      const me = await this.getUserById(meta.user.sub);

      // 2) 파트너 정보 가져오기
      const partner = await this.getUserById(partnerId);

      // 3) 커플 상태 체크 및 기존 데이터 확인
      await this.validateCoupleStatus(me.id, partner.id, isConnect);

      if (isConnect) {
        // 4.1) 커플 생성 및 저장
        const couple = queryRunner.manager.create(Couple, {
          user1Id: me.id,
          user2Id: partner.id,
        });
        await queryRunner.manager.save(couple);

        // 4.2) 채팅방 생성 및 저장
        await this.createChatRoom(me.id, partner.id, couple.id);
      } else {
        const coupleId = await this.getCoupleByUserId(me.id);

        // 4.1) 유저 chatRoom - chat 삭제
        await this.deleteChatroomAndChats(coupleId, me.id, partner.id);

        // 4.2) 유저 couple 관련 테이블 삭제
        await queryRunner.manager.delete(Anniversary, { coupleId });
        await queryRunner.manager.delete(Plan, { coupleId });
        await queryRunner.manager.delete(Calendar, { coupleId });
        await queryRunner.manager.delete(Couple, { id: coupleId });
      }

      // 5) 커플 연결 상태 알림 생성 및 전송
      this.createMatchedNotification(me.id, isConnect);
      this.createMatchedNotification(partner.id, isConnect);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: isConnect
          ? '커플이 연결 되었습니다.'
          : '커플 연결이 해제되었습니다.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async getUserById(userId: string) {
    const resp = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { userId }),
    );

    if (!resp || !resp.data) {
      throw new NotFoundException('해당 파트너를 찾을 수 없습니다.');
    }

    return resp.data;
  }

  private async validateCoupleStatus(
    user1Id: string,
    user2Id: string,
    isConnect: boolean,
  ) {
    const existingCouple = await this.coupleRepository
      .createQueryBuilder('couple')
      .where(
        'couple.user1Id IN (:user1Id, :user2Id) OR couple.user2Id IN (:user1Id, :user2Id)',
        { user1Id, user2Id },
      )
      .getOne();

    if (isConnect && existingCouple) {
      throw new ConflictException('이미 커플 관계가 존재합니다.');
    }

    if (!isConnect && !existingCouple) {
      throw new ConflictException('커플 관계가 존재하지 않습니다.');
    }
  }

  private async createChatRoom(
    user1Id: string,
    user2Id: string,
    coupleId: string,
  ) {
    const resp = await lastValueFrom(
      this.chatService.send(
        { cmd: 'create_chat_room' },
        { user1Id, user2Id, coupleId },
      ),
    );

    if (!resp || !resp.data) {
      throw new NotFoundException(
        '채팅방 생성에 실패했습니다. 다시 시도해주세요.',
      );
    }

    return resp?.data ?? null;
  }

  private async createMatchedNotification(userId: string, isConnect: boolean) {
    this.notificationService.emit(
      { cmd: 'matched_notification' },
      { userId, isConnect },
    );
  }

  private async deleteChatroomAndChats(
    coupleId: string,
    user1Id: string,
    user2Id: string,
  ) {
    this.chatService.emit(
      { cmd: 'delete_chatroom_and_chats' },
      { coupleId, user1Id, user2Id },
    );
  }

  async getCoupleByUserId(userId: string): Promise<string | null> {
    const couple = await this.coupleRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    return couple ? couple.id : null;
  }
}
