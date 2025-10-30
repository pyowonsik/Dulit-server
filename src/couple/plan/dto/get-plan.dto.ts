import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetPlanDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '약속 주제 (검색용, 선택사항)',
    example: '까치산역 데이트',
    required: false,
  })
  topic?: string;
}
