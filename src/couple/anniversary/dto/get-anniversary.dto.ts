import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAnniversaryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '기념일 제목 (검색용, 선택사항)',
    example: '우리가 사귄날',
    required: false,
  })
  title?: string;
}
