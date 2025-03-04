import { BaseTable } from 'src/common/entity/base-table.entity';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CommentModel extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn()
  author: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn()
  post: Post;
}
