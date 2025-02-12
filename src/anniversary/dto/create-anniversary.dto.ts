import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class CreateAnniversaryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '기념일 제목',
    example: '우리가 사귄날',
  })
  title: string;

  @Type(() => Date) // 문자열을 Date 객체로 자동 변환
  @IsDate()
  @ApiProperty({
    description: '기념일',
    example: '2025-02-07T06:30:05.016Z',
  })
  date: Date;
}
