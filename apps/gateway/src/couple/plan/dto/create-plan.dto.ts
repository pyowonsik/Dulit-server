import { UserPayloadDto } from '@app/common/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '약속 주제',
    example: '까치산역 데이트',
  })
  topic: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '약속 장소',
    example: '까치산역 1번 출구',
  })
  location: string;

  @Type(() => Date) // 문자열을 Date 객체로 자동 변환
  @IsDate()
  @ApiProperty({
    description: '약속 시간',
    example: '2025-02-07T06:30:05.016Z',
  })
  time: Date;
}
