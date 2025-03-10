import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Couple } from './entity/couple.entity';
import { Repository } from 'typeorm';
// import { CreateCoupleDto } from './dto/create-couple.dto';
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
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(CHAT_SERVICE)
    private readonly chatService: ClientProxy,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Anniversary)
    private readonly anniversaryRepository: Repository<Anniversary>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
  ) {}

  async connectCouple(createCoupleDto: ConnectCoupleDto) {
    const { partnerId, isConnect, meta } = createCoupleDto;

    // 1) 본인 정보 가져오기
    const me = await this.getUserById(meta.user.sub);

    // 2) 파트너 정보 가져오기
    const partner = await this.getUserById(partnerId);

    // 3) 커플 상태 체크 및 기존 데이터 확인
    await this.validateCoupleStatus(me.id, partner.id, isConnect);

    if (isConnect) {
      // 4.1) 커플 생성 및 저장
      const coupleId = await this.createCouple(me.id, partner.id);

      // 4.2) 채팅방 생성 및 저장
      await this.createChatRoom(me.id, partner.id, coupleId);
    } else {
      const coupleId = await this.getCoupleByUserId(me.id);

      // 4.1) 유저 chatRoom - chat 삭제
      await this.deleteChatroomAndChats(coupleId);

      // 4.2) 유저 couple 관련 테이블 삭제 (plan,post,calendar)
      await this.deleteCoupleAndRelatedData(coupleId);
    }

    // 5) 커플 연결 상태 알림 생성 및 전송
    this.createMatchedNotification(me.id, isConnect);
    this.createMatchedNotification(partner.id, isConnect);

    return {
      success: true,
      message: isConnect
        ? '커플이 연결 되었습니다.'
        : '커플 연결이 해제되었습니다.',
    };
  }

  // socialId를 이용하여 유저 정보를 가져옴
  private async getUserById(userId: string) {
    const resp = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { userId }),
    );

    if (!resp || !resp.data) {
      throw new NotFoundException('해당 파트너를 찾을 수 없습니다.');
    }

    return resp.data;
  }

  /** 기존 커플 존재 여부 확인 */
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

  /** 커플 채팅방 생성 */
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

  /** 커플 정보 저장 */
  private async createCouple(user1Id: string, user2Id: string) {
    const couple = await this.coupleRepository.create({
      user1Id,
      user2Id,
    });
    await this.coupleRepository.save(couple);

    if (!couple) {
      throw new BadRequestException(
        '커플 정보를 생성할 수 없습니다. 다시 시도해주세요.',
      );
    }

    return couple.id;
  }

  /** 알림 생성 및 전송 */
  private async createMatchedNotification(userId: string, isConnect: boolean) {
    this.notificationService.emit(
      { cmd: 'matched_notification' },
      { userId, isConnect },
    );
  }

  async getCoupleByUserId(userId: string): Promise<string | null> {
    const couple = await this.coupleRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    return couple ? couple.id : null;
  }

  // 현재 들어가 있는 소켓 연결 해제 기능 필요 , 커플 Id만 받아서 한번만 호출하도록 변경.
  // -> 커플 연결 해제시 , 채팅소켓 알림소켓이 유지되고 있음.

  /** 커플 채팅방 , 채팅 삭제 */
  private async deleteChatroomAndChats(coupleId: string) {
    this.chatService.emit({ cmd: 'delete_chatroom_and_chats' }, { coupleId });
  }

  /** 커플 관계 데이터 삭제 */
  private async deleteCoupleAndRelatedData(coupleId: string) {
    await this.anniversaryRepository.delete({
      coupleId,
    });
    await this.planRepository.delete({
      coupleId,
    });
    await this.calendarRepository.delete({
      coupleId,
    });
    await this.coupleRepository.delete({
      id: coupleId,
    });
  }
}
