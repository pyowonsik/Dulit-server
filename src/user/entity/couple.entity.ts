import { BaseTable } from 'src/common/entity/base-table.entity';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class Couple extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => User, (user) => user.couple)
  users: User[];

  @OneToOne(() => ChatRoom, (chatRoom) => chatRoom.couple)
  chatRoom: ChatRoom;

  @OneToMany(() => Post, (post) => post.couple)
  posts: Post[];
}
