import { Transform } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { Couple } from 'src/user/entity/couple.entity';
import { User } from 'src/user/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentModel } from '../comment/entity/comment.entity';
import { PostUserLike } from '../comment/entity/post-user-like.entity';

@Entity()
export class Post extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  // PostgreSQL의 text[] 배열 타입으로 설정
  @Column('text', { array: true })
  @Transform(({ value }) =>
    value.map((filePath) => `http://localhost:3000/${filePath}`),
  )
  filePaths: string[];

  // User , Couple
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn()
  author: User;

  @ManyToOne(() => Couple, (couple) => couple.posts)
  @JoinColumn()
  couple: Couple;

  // 댓글 , 좋아요
  @OneToMany(() => CommentModel, (comment) => comment.post)
  comments: CommentModel[];

  @OneToMany(() => PostUserLike, (pul) => pul.post)
  likedUsers : PostUserLike[];
}
