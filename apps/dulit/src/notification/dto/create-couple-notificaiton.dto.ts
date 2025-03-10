import { IsBoolean, IsString } from 'class-validator';

export class CreateCoupleNotificationDto {
  @IsString()
  userId: string;

  @IsBoolean()
  isConnect: string;
}
