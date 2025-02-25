import { BaseTable } from 'src/common/entity/base-table.entity';
import { Couple } from 'src/couple/entity/couple.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Anniversary extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Couple, (couple) => couple.anniversaries)
  @JoinColumn()
  couple: Couple;
}
