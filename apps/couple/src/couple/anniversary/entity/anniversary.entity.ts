import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Couple } from '../../entity/couple.entity';
import { BaseTable } from '@app/common';

@Entity()
export class Anniversary extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'date' })
  date: Date;

  // @ManyToOne(() => Couple, (couple) => couple.anniversaries)
  // @JoinColumn()
  // couple: Couple;

  @Column()
  coupleId: string;
}
