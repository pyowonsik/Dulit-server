import { BaseTable } from 'src/common/entity/base-table.entity';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Post } from 'src/post/entity/post.entity';
import { Anniversary } from 'src/anniversary/entity/anniversary.entity';

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

  @OneToMany(() => Plan, (plan) => plan.couple)
  plans: Plan[];

  // 디데이 , 달력
  @OneToMany(() => Anniversary, (anniversary) => anniversary.couple)
  anniversaries: Anniversary[];
}

