import { Anniversary } from '../entity/anniversary.entity';

export class AnniversaryResponseDto {
  id: number;
  title: string;
  date: Date;

  constructor(anniversary: Anniversary) {
    this.id = anniversary.id;
    this.title = anniversary.title;
    this.date = anniversary.date;
  }
}
