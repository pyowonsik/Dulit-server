import { BaseTable } from 'src/common/entity/base-table.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { Couple } from 'src/user/entity/couple.entity';

@Entity()
export class ChatRoom extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable()
  users: User[];

  @OneToMany(() => Chat, (chat) => chat.chatRoom)
  chats: Chat[];

  @OneToOne(() => Couple, (couple) => couple.chatRoom)
  @JoinColumn()
  couple: Couple;
  
}
