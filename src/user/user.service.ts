import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { Chat } from 'src/chat/entity/chat.entity';
import { Post } from 'src/post/entity/post.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { AuthService } from 'src/auth/auth.service';
import { Couple } from 'src/couple/entity/couple.entity';
import { CreateCoupleDto } from 'src/couple/dto/create-couple.dto';
import { Plan } from 'src/couple/plan/entities/plan.entity';
import { Anniversary } from 'src/couple/anniversary/entity/anniversary.entity';
import { Calendar } from 'src/couple/calendar/entities/calendar.entity';

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
    @Inject(forwardRef(() => AuthService)) // 순환 종속성 문제 해결을 위한 지연 주입
    private readonly authService: AuthService,
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

    return {
      accessToken: await this.authService.issueToken(user, false),
      refreshToken: await this.authService.issueToken(user, true),
      user,
    };
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

  async findPartnerById(partnerId: number) {
    const user = await this.userRepository.findOne({
      where: {
        socialId: partnerId.toString(),
      },
      select: ['name', 'email', 'socialId'],
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
    await this.deleteChatRoomsAndChats(user, qr);

    // 2. 유저가 속한 couple - plan , post 삭제
    await this.deleteCoupleAndRelatedData(user, qr);

    // 3. 유저 삭제
    await qr.manager.delete(User, id);

    return id;
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
