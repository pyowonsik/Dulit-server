import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';

export class GetAnniversaryDto extends PagePaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '기념일 제목',
    example: '우리가 사귄날',
  })
  title?: string;
}
