import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Couple } from './entity/couple.entity';
import { CreateCoupleDto } from './dto/create-couple.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let user = await this.userRepository.findOne({
      where: { kakaoId: createUserDto.kakaoId },
    });

    if (!user) {
      user = await this.userRepository.save({
        kakaoId: createUserDto.kakaoId,
        email: createUserDto.email,
        name: createUserDto.name,
      });
    }

    return user;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저의 ID 입니다.');
    }

    return user;
  }

  // 로직상 유저 정보 변경로직은 필요없는 것으로 판단.
  // 관계 수정 필요시, 해당 모듈에서 직접 수정
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // 트랜잭션 적용 : 삭제 과정중 실패시 쿼리가 실행 되면 안됨 
  async remove(id: number, qr: QueryRunner) {
    const user = await qr.manager.findOne(User, {
      where: { id },
      relations: ['chatRooms', 'couple'],
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저의 ID 입니다.');
    }

    // 1. 유저가 속한 chatRoom 삭제
    if (user.chatRooms.length > 0) {
      await qr.manager.delete(ChatRoom, user.chatRooms[0].id);
    }

    // 2. 커플 정보 가져오기 및 커플 관계 해제
    if (user.couple) {
      const couple = await qr.manager.findOne(Couple, {
        where: { id: user.couple.id },
        relations: ['users'],
      });

      // (커플 테이블에서 해당 커플 삭제 및 유저 테이블에서 커플 관계 해제)
      if (couple?.users) {
        await Promise.all(
          couple.users.map((user) =>
            qr.manager.update(User, user.id, { couple: null }),
          ),
        );
        await qr.manager.delete(Couple, couple.id);
      }
    }

    // 3. 유저 삭제
    await qr.manager.delete(User, id);

    return id;
  }

  async matchCouple(createCoupleDto: CreateCoupleDto, qr: QueryRunner) {
    const me = await qr.manager.findOne(User, {
      where: { kakaoId: createCoupleDto.myId },
      relations: ['couple'],
    });
    const partner = await qr.manager.findOne(User, {
      where: { kakaoId: createCoupleDto.partnerId },
      relations: ['couple'],
    });

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

    // 쿼리 최적화
    const user = await qr.manager.findOne(User, {
      where: { kakaoId: createCoupleDto.myId },
      relations: ['couple', 'chatRooms'],
    });

    return user;
  }
}
