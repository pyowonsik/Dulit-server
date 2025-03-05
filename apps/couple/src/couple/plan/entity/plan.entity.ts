import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Couple } from '../../entity/couple.entity';
import { BaseTable } from '@app/common';

@Entity()
export class Plan extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: string;

  @Column()
  location: string;

  @Column()
  time: Date;

  // @ManyToOne(() => Couple, (couple) => couple.plans)
  // @JoinColumn()
  // couple: Couple;

  @Column()
  coupleId: string;
}
