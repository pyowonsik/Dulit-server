// Couple 엔티티
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Plan } from '../plan/entity/plan.entity';
import { Calendar } from '../calendar/entity/calendar.entity';
import { Anniversary } from '../anniversary/entity/anniversary.entity';
import { BaseTable } from '@app/common';

@Entity()
export class Couple extends BaseTable{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user1Id: string;

  @Column()
  user2Id: string;


  // 같은 마이크로 서비스에 있기 때문에 참조 가능하므로 자식쪽에서만 부모 id값 들고 있으면 됨.
  // 특히 msa 같은 경우 느슨한 결합 (Loose Coupling)을 강조 하는 것으로 보임.

  // @OneToMany(() => Plan, (plan) => plan.couple)
  // plans: Plan[];

  // @OneToMany(() => Calendar, (calendar) => calendar.couple)
  // calendars: Calendar[];

  // @OneToMany(() => Anniversary, (anniversary) => anniversary.couple)
  // anniversaries: Anniversary[];
}
