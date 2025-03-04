import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Couple } from '../../entity/couple.entity';

@Entity()
export class Anniversary {
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
