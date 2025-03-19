import { Calendar } from '../entities/calendar.entity';

export class CalendarResponseDto {
  id: number;
  title: string;
  description: string;
  date: Date;
  filePaths: string[] | null;

  constructor(calendar: Calendar) {
    this.id = calendar.id;
    this.title = calendar.title;
    this.description = calendar.description;
    this.date = calendar.date;
    this.filePaths = calendar.filePaths;
  }
}
