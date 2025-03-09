import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { Couple } from '../../entity/couple.entity';
import { BaseTable } from '@app/common';
@Entity()
export class Calendar extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: Date;

  // PostgreSQL의 text[] 배열 타입으로 설정
  @Column('text', { array: true, nullable: true })
  @Transform(({ value }) =>
    value.map((filePath) => `http://localhost:3000/${filePath}`),
  )
  filePaths: string[] | null;

  // @ManyToOne(() => Couple, (couple) => couple.calendars)
  // @JoinColumn()
  // couple: Couple;

  @Column()
  coupleId: string;
}
