import { Couple } from 'src/user/entity/couple.entity';
import { User } from 'src/user/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
    export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  // PostgreSQL의 text[] 배열 타입으로 설정
  @Column("text", { array: true })
  photoFilePath: string[]

  // User , Couple
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn()
  author: User;

  @ManyToOne(() => Couple, (couple) => couple.posts)
  @JoinColumn()
  couple: Couple;
}
