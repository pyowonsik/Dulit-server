import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum Role {
  admin,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  kakaoId: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;

  // 자기 자신과 일대일 관계 (매칭)
  @OneToOne(() => User, { nullable: true })
  @JoinColumn() // ForeignKey 역할을 하는 컬럼 (기본적으로 user_id를 생성)
  matchedUser: User | null; // 매칭된 사용자

  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom[];
}
