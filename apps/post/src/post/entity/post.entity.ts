import { BaseTable } from '@app/common';
import { Transform } from 'class-transformer';
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
@Entity()
export class Post extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  // PostgreSQL의 text[] 배열 타입으로 설정
  @Column('text', { array: true, nullable: true })
  @Transform(({ value }) =>
    value.map((filePath) => `http://localhost:3000/${filePath}`),
  )
  filePaths: string[] | null;

  @Column()
  authorId: String;
}
