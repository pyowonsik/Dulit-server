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
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from 'src/post/entity/post.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { PostUserLike } from 'src/post/comment/entity/post-user-like.entity';
import { Couple } from 'src/couple/entity/couple.entity';
export enum Role {
  admin,
  user,
}

export enum SocialProvider {
  kakao = 'kakao',
  apple = 'apple',
  naver = 'naver',
  common = 'common',
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
    default: SocialProvider.common,
  })
  socialProvider: SocialProvider;

  @Column()
  name: string;

  @Column()
  password: string;

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

  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => CommentModel, (comment) => comment.author)
  comments: CommentModel[];

  @OneToMany(() => PostUserLike, (pul) => pul.user)
  likedPosts: PostUserLike[];
}

// @JoinColumn() : OneToOne , ManyToOne -> tableId
// @JoinTable() : ManyToMany

// CASCADE -> 데이터 수정 , 삭제 , 생성시 연관되어 있는 다른 테이블에 영향을 끼칠수 있는데
// 이때 , 부모 관련 엔티티에도 동일한 작업이 전파되도록한다.
// 허나 무차별적으로 사용할 경우 의도치 않은 데이터 삭제를 유발해 데이터 무결성을 보장하기 위해,
// 명시적 삭제를 권한다.
// -> 예를 들면 Movie - MovieDetail 의 부모 - 자식 관계에서 Movie 테이블에서 movie를
// MovieDetail 테이블에서 movieDetail을 삭제 해야 한다.

// 트랜잭션이나 쿼리 빌더 내에서 해당 옵션이 자동으로 적용되지는 않습니다.
// 즉, 트랜잭션이나 쿼리 빌더를 사용할 때 onDelete: 'CASCADE' 옵션은 자동으로 동작하지 않습니다.
// 따라서 수정,삭제시 오류 처리하려면
// 1. 명시적 삭제를 하는 방법과
// 2. onDelete : 'cascade' 옵션을 사용하면서  .relation(Movie, 'genres').of(movieId) 이런식으로 관계를 만들어줘야함.
