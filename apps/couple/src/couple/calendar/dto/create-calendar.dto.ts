import { UserPayloadDto } from '@app/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCalendarDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '캘린더 일정 제목',
    example: '오늘은 ~~~~ 놀러가는 날~~~',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '캘린덩 일정 설명',
    example: '재밌고 맛있는 여행 ^^',
  })
  description: string;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: '캘린더 일정 날짜',
    example: '2025-03-30',
  })
  date: Date;

  @IsOptional() // 필수값 아님
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'POST FILE PATHS (선택값)',
    example: ['aPhoto.jpg', 'bPhoto.jpg'],
  })
  filePaths?: string[];
}
