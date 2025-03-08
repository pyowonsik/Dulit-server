import { CursorPaginationDto, UserPayloadDto } from '@app/common/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetPlansDto extends CursorPaginationDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '약속 주제',
    example: '까치산역 데이트',
  })
  topic?: string;
}
