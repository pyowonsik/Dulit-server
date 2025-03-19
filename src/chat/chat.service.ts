import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatRoom } from './entity/chat-room.entity';
import { Chat } from './entity/chat.entity';
import { User } from 'src/user/entity/user.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ChatService {
  private readonly connectedClients = new Map<number, Socket>();

  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  registerClient(userId: number, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: number) {
    this.connectedClients.delete(userId);
  }

  async joinUserRooms(user: { sub: number }, client: Socket) {
    const chatRooms = await this.findMyChatRoom(user.sub);
    if (chatRooms.length === 0) {
      client.emit('error', { message: '커플이 매칭 되지 않은 사용자입니다.' });
      return;
    }

    // socket Connect -> client(socket) chatRooms의 id 값으로 join
    chatRooms.forEach((room) => {
      client.join(room.id.toString());
    });
  }

  async createMessage(
    payload: { sub: number },
    { message }: CreateChatDto,
    qr: QueryRunner,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
    });

    const chatRoom = await this.findMyChatAndChatRoom(qr, payload.sub);

    const msgModel = await qr.manager.save(Chat, {
      author: user,
      message,
      chatRoom,
    });

    const client = this.connectedClients.get(user.id);

    // chat이 비어있을때 roomCreated 처리 가능
    // chatRooms.id의 'newMessage'스트림으로 client(socket)으로 메세지 emit
    client
      .to(chatRoom.id.toString())
      .emit('sendMessage', plainToClass(Chat, msgModel));

    return message;
  }

  /* istanbul ignore next */
  async findMyChatRoom(userId: number) {
    return await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoinAndSelect('chatRoom.users', 'user') // chatRoom과 users 테이블을 조인
      .where('user.id = :userId', { userId }) // user.id로 필터링
      .getMany();
  }

  /* istanbul ignore next */
  async findMyChatAndChatRoom(qr: QueryRunner, userId: number) {
    return await qr.manager
      .createQueryBuilder(ChatRoom, 'chatRoom')
      .leftJoinAndSelect('chatRoom.users', 'user')
      .leftJoinAndSelect('chatRoom.chats', 'chat')
      .where('user.id = :userId', { userId })
      .getOne();
  }
}
