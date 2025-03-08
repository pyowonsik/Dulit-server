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
    private readonly coupleRepository: Repository<Couple>, // 커플 정보 저장소 추가
  ) {}

  async connectCouple(createCoupleDto: ConnectCoupleDto) {
    const { partnerId, meta } = createCoupleDto;

    // 1) 본인 정보 가져오기
    const me = await this.getUserById(meta.user.sub);

    // 2) 파트너 정보 가져오기
    const partner = await this.getUserById(partnerId);

    // // 3) 커플 상태 체크 및 기존 데이터 확인
    await this.validateCoupleNotExists(me.id, partner.id);
    console.log('success');

    // // 4) 커플 생성 및 저장
    const coupleId = await this.createCouple(me.id, partner.id);

    // // 5) 채팅방 생성 및 저장
    await this.createChatRoom(me.id, partner.id, coupleId);

    // // 6) 알림 생성 및 전송
    this.createMatchedNotification(me.id);
    this.createMatchedNotification(partner.id);

    // console.log(`----- [SUCCESS] - coupleId : ${coupleId} -----`);
    // console.log(chatRoom);
    return { success: true, message: '커플 연결이 완료되었습니다.' };
  }

  // // 토큰을 검증하여 유저 정보를 가져옴
  // private async getUserFromToken(token: string) {
  //   const resp = await lastValueFrom(
  //     this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
  //   );

  //   if (!resp?.data?.sub) {
  //     throw new BadRequestException('유효하지 않은 토큰입니다.');
  //   }

  //   return await this.getUserById(resp.data.sub);
  // }

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
  private async validateCoupleNotExists(user1Id: string, user2Id: string) {
    const existingCouple = await this.coupleRepository
      .createQueryBuilder('couple')
      .where(
        'couple.user1Id IN (:user1Id, :user2Id) OR couple.user2Id IN (:user1Id, :user2Id)',
        { user1Id, user2Id },
      )
      .getOne();

    // console.log(existingCouple);

    if (existingCouple) {
      throw new ConflictException('이미 커플 관계가 존재합니다.');
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
  private async createMatchedNotification(userId: string) {
    await this.notificationService.emit(
      { cmd: 'matched_notification' },
      { userId },
    );
  }

  async getCoupleByUserId(userId: string): Promise<string | null> {
    const couple = await this.coupleRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    return couple ? couple.id : null;
  }
}
