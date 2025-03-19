import { BaseTable } from 'src/common/entity/base-table.entity';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { Anniversary } from '../anniversary/entity/anniversary.entity';
import { Calendar } from '../calendar/entities/calendar.entity';
import { Plan } from '../plan/entities/plan.entity';

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

  @OneToMany(() => Calendar, (calendar) => calendar.couple)
  calendars: Calendar[];
}
