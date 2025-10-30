import { Anniversary } from '../entity/anniversary.entity';

export class AnniversaryResponseDto {
  id: number;
  title: string;
  date: string; // ✅ string으로 변경 (yyyy-MM-dd 형식)
  createdAt: Date;
  updatedAt: Date;

  constructor(anniversary: Anniversary) {
    this.id = anniversary.id;
    this.title = anniversary.title;
    // ✅ Date → "yyyy-MM-dd" 형식 문자열 변환
    this.date = this.formatDate(anniversary.date);
    this.createdAt = anniversary.createdAt;
    this.updatedAt = anniversary.updatedAt;
  }

  /**
   * Date를 "yyyy-MM-dd" 형식 문자열로 변환
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
