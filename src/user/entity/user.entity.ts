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
import { Plan } from 'src/plan/entities/plan.entity';
export enum Role {
  admin,
  user,
}

export enum SocialProvider {
  kakao = 'kakao',
  apple = 'apple',
  naver = 'naver',
  unknown = 'unknwon',
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  socialId: string;

  @Column()
  email: string;

  @Column({
    enum: SocialProvider,
    default: SocialProvider.unknown,
  })
  socialProvider: SocialProvider;

  @Column()
  name: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom[];

  @ManyToOne(() => Couple, (couple) => couple.users)
  @JoinColumn()
  couple: Couple;

  @OneToMany(() => Chat, (chat) => chat.author, { onDelete: 'CASCADE' })
  chats: Chat[];

  @OneToMany(() => Post, (post) => post.author, { onDelete: 'CASCADE' })
  posts: Post[];

  @OneToMany(() => Plan, (plan) => plan.couple, { onDelete: 'CASCADE' })
  plans: Plan[];
}

// @JoinColumn() : OneToOne , ManyToOne  -> tableId
// @JoinTable() : ManyToMany

// CASCADE -> 데이터 수정 , 삭제 , 생성시 연관되어 있는 다른 테이블에 영향을 끼칠수 있는데
// 이때 , 부모 관련 엔티티에도 동일한 작업이 전파되도록한다.
// 허나 무차별적으로 사용할 경우 의도치 않은 데이터 삭제를 유발해 데이터 무결성을 보장하기 위해,
// 명시적 삭제를 권한다.
// -> 예를 들면 Movie - MovieDetail 의 부모 - 자식 관계에서 Movie 테이블에서 movie를
// MovieDetail 테이블에서 movieDetail을 삭제 해야 한다.

// 명시적 작업 필요 유무
// (생성)	필요 없음 Cascade 설정이 없는 경우에도 연관 관계만 잘 설정되면 부모-자식 관계는 자동으로 연결됩니다.
// (수정)	필    요 양방향 관계에서 한쪽 수정 후 다른쪽 객체를 명시적으로 수정해야 할 수 있습니다.
// (삭제)	필    요 Cascade가 없으면 부모-자식 관계가 있을 때 양쪽 객체를 명시적으로 삭제해야 할 수 있습니다.
