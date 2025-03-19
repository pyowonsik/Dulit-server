import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { Couple } from 'src/couple/entity/couple.entity';

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
    value.map((filePath) =>
      process.env.ENV === 'prod'
        ? `http://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${value}`
        : `http://localhost:3000/${filePath}`,
    ),
  )
  filePaths: string[] | null;

  @ManyToOne(() => Couple, (couple) => couple.calendars)
  @JoinColumn()
  couple: Couple;
}
