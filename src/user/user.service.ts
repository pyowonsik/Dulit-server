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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
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

    // const newChatRoom = await qr.manager.save(ChatRoom, {
    //   users: [me, partner],
    // });
    // await qr.manager.save(Couple, {
    //   users: [me, partner],
    //   chatRoom: newChatRoom,
    // });

    // 쿼리 최적화
    const user = await qr.manager.findOne(User, {
      where: { kakaoId: createCoupleDto.myId },
      relations: ['couple', 'chatRooms'],
    });

    // const user = await qr.manager
    //   .createQueryBuilder(User, 'user')
    //   .leftJoinAndSelect('user.couple', 'couple')
    //   .leftJoinAndSelect('user.chatRooms', 'chatRooms')
    //   .where('user.kakaoId = :kakaoId', { kakaoId: createCoupleDto.myId })
    //   .getOne();

    return user;
  }
}
