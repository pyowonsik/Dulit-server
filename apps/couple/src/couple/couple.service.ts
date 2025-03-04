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
import { CreateCoupleDto } from './dto/create-couple.dto';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { USER_SERVICE } from '@app/common';

@Injectable()
export class CoupleService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>, // 커플 정보 저장소 추가
  ) {}

  async connectCouple(token: string, partnerSocialId: string) {
    // 1) 본인 정보 가져오기
    const me = await this.getUserFromToken(token);
    if (!me) {
      throw new BadRequestException('유효하지 않은 토큰입니다.');
    }

    // 2) 파트너 정보 가져오기
    const partner = await this.getUserBySocialId(partnerSocialId);
    if (!partner) {
      throw new NotFoundException('해당 파트너를 찾을 수 없습니다.');
    }

    // 3) 커플 상태 체크 및 기존 데이터 확인
    // await this.validateCoupleNotExists(me.id, partner.id);

    // 4) 채팅방 생성 및 저장 (별도 서비스 호출 필요)

    // 5) 커플 생성 및 저장 (별도 서비스 호출 필요)
    await this.createCouple(me.socialId, partner.socialId);

    // 6) 알림 생성 및 전송

    return { success: true, message: '커플 연결이 완료되었습니다.' };
  }

  // 토큰을 검증하여 유저 정보를 가져옴
  private async getUserFromToken(token: string) {
    // try {
    const tResp = await lastValueFrom(
      this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
    );
    if (!tResp?.data?.socialId) return null;

    return await this.getUserBySocialId(tResp.data.socialId);
    // } catch (error) {
    //   return null;
    // }
  }

  // socialId를 이용하여 유저 정보를 가져옴
  private async getUserBySocialId(socialId: string) {
    // try {
    const uResp = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { socialId }),
    );
    return uResp?.data ?? null;
    // } catch (error) {
    //   return null;
    // }
  }

  /** 기존 커플 존재 여부 확인 */
  // private async validateCoupleNotExists(user1Id: string, user2Id: string) {
  //   try {
  //     const couple1 = await this.coupleRepository.findOne({
  //       where: {
  //         user1Id: user1Id.toString().toLowerCase(),
  //       },
  //     });

  //     const couple2 = await this.coupleRepository.findOne({
  //       where: {
  //         user2Id: user1Id.toString().toLowerCase(),
  //       },
  //     });

  //     console.log('couple1:', couple1);
  //     console.log('couple2:', couple2);

  //     if (couple1 || couple2) {
  //       throw new ConflictException('이 조합은 이미 커플로 등록되어 있습니다.');
  //     }
  //   } catch (error) {
  //     console.error('Error during validateCoupleNotExists:', error);
  //     throw error;
  //   }
  // }

  /** 커플 정보 저장 */
  private async createCouple(user1Id: string, user2Id: string) {
    const couple = await this.coupleRepository.create({
      user1Id,
      user2Id,
    });
    await this.coupleRepository.save(couple);
  }
}
