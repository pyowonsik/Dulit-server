import { BaseTable } from '@app/common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
export class User extends BaseTable{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable : true })
  socialId?: string;

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

  // @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  // chatRooms: ChatRoom[];

  // @ManyToOne(() => Couple, (couple) => couple.users)
  // @JoinColumn()
  // couple: Couple;

  // @OneToMany(() => Chat, (chat) => chat.author)
  // chats: Chat[];

  // @OneToMany(() => Post, (post) => post.author)
  // posts: Post[];

  // @OneToMany(() => CommentModel, (comment) => comment.author)
  // comments: CommentModel[];

  // @OneToMany(() => PostUserLike, (pul) => pul.user)
  // likedPosts: PostUserLike[];
}
