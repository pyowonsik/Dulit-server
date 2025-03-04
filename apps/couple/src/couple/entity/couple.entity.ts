// Couple 엔티티
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Couple {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  //   @OneToMany(() => Plan, (plan) => plan.couple)
  //   plans: Plan[];

  //   @OneToMany(() => Calendar, (calendar) => calendar.couple)
  //   calendars: Calendar[];

  //   @OneToMany(() => Anniversary, (anniversary) => anniversary.couple)
  //   anniversaries: Anniversary[];
}
