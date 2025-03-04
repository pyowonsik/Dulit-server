
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Couple } from '../../entity/couple.entity';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: string;

  @Column()
  location: string;

  @Column()
  time: Date;

  @ManyToOne(() => Couple, (couple) => couple.plans)
  @JoinColumn()
  couple: Couple;

}
