import { BaseTable } from 'src/common/entity/base-table.entity';
import { Couple } from 'src/user/entity/couple.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => Couple, (couple) => couple.plans)
  @JoinColumn()
  couple: Couple;

  @ManyToOne(() => User, (user) => user.plans)
  @JoinColumn()
  author: User;
}
