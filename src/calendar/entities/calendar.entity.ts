import { Couple } from 'src/user/entity/couple.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base-table.entity';

@Entity()
export class Calendar extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => Couple, (couple) => couple.calendars)
  @JoinColumn()
  couple: Couple;
}
