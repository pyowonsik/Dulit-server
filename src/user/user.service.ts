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
import { Plan } from 'src/plan/entities/plan.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { Post } from 'src/post/entity/post.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';

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
    private readonly notificationService: NotificationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let user = await this.userRepository.findOne({
      where: { socialId: createUserDto.socialId },
    });

    if (!user) {
      user = await this.userRepository.save({
        socialId: createUserDto.socialId,
        email: createUserDto.email,
        name: createUserDto.name,
        socialProvider: createUserDto.socialProvider,
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

    // 1. 유저가 속한 chatRoom - chat 삭제
    if (user.chatRooms.length > 0) {
      // 채팅방 - 채팅 사이 자식 관계 지우기

      await qr.manager.delete(Chat, {
        chatRoom: user.chatRooms[0],
      });

      await qr.manager.delete(ChatRoom, user.chatRooms[0].id);
    }

    // 2. 유저가 속한 couple - plan , post 삭제
    if (user.couple) {
      // couple - plan , post 사이 자식 관계 지우기

      const couple = await qr.manager.findOne(Couple, {
        where: { id: user.couple.id },
        relations: ['users'],
      });

      if (couple?.users) {
        await Promise.all(
          couple.users.map(async (user) => {
            await qr.manager.update(User, user.id, { couple: null });
            // 커플간 post가 지워지는 거면 , 커플에 속한 user들 comments가 지워져야함
            await qr.manager.delete(CommentModel, {
              author: user,
            });
          }),
        );

        await qr.manager.delete(Plan, {
          couple: user.couple,
        });

        await qr.manager.delete(Post, {
          couple: user.couple,
        });

        await qr.manager.delete(Couple, couple.id);
      }
    }

    // 3. 유저 삭제
    await qr.manager.delete(User, id);

    return id;
  }

  async connectCouple(createCoupleDto: CreateCoupleDto, qr: QueryRunner) {
    const me = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.myId },
      relations: ['couple'],
    });
    const partner = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.partnerId },
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

    this.notificationService.matchedNotification(me.id);
    this.notificationService.matchedNotification(partner.id);

    // 쿼리 최적화
    const user = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.myId },
      relations: ['couple', 'chatRooms'],
    });

    return user;
  }

  async disConnectCouple(createCoupleDto: CreateCoupleDto, qr: QueryRunner) {
  
    const me = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.myId },
      relations: ['couple','chatRooms'],
    });
    const partner = await qr.manager.findOne(User, {
      where: { socialId: createCoupleDto.partnerId },
      relations: ['couple'],
    });


   
    if (!me || !partner)
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    if (!me.couple || !partner.couple)
      throw new BadRequestException('매칭이 되지 않은 사용자입니다.');

    // 1. 유저가 속한 chatRoom - chat 삭제
    if (me.chatRooms.length > 0) {
      // 채팅방 - 채팅 사이 자식 관계 지우기

      await qr.manager.delete(Chat, {
        chatRoom: me.chatRooms[0],
      });

      await qr.manager.delete(ChatRoom, me.chatRooms[0].id);
    }

    // 2. 유저가 속한 couple - plan , post 삭제
    if (me.couple) {
      // couple - plan , post 사이 자식 관계 지우기

      const couple = await qr.manager.findOne(Couple, {
        where: { id: me.couple.id },
        relations: ['users'],
      });

      if (couple?.users) {
        await Promise.all(
          couple.users.map(async (user) => {
            await qr.manager.update(User, user.id, { couple: null });
            // 커플간 post가 지워지는 거면 , 커플에 속한 user들 comments가 지워져야함
            await qr.manager.delete(CommentModel, {
              author: user,
            });
          }),
        );
        await qr.manager.delete(Plan, {
          couple: me.couple,
        });
        await qr.manager.delete(Post, {
          couple: me.couple,
        });

        await qr.manager.delete(Couple, couple.id);
      }
    }

    this.notificationService.sendNotification(me.id, '커플 연결이 해제되었습니다.');
    this.notificationService.sendNotification(partner.id, '커플 연결이 해제되었습니다.');

    return me.id;
  }
}
