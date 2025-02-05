import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Couple } from './couple.entity';
import { Post } from 'src/post/entities/post.entity';
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

  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom[];

  @ManyToOne(() => Couple, (couple) => couple.users)
  @JoinColumn()
  couple: Couple;

  @OneToMany(() => Post, (post) => post.author)
  posts : Post[];

}

// @JoinColumn() : OneToOne , ManyToOne
// @JoinTable() : ManyToMany
