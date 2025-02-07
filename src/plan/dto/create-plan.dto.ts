import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @Type(() => Date) // 문자열을 Date 객체로 자동 변환
  @IsDate()
  time: Date;

  //   @IsNotEmpty()
  //   @IsNumber()
  //   authorId: number;

  //   @IsNotEmpty()
  //   @IsNumber()
  //   coupleId: number;
}
