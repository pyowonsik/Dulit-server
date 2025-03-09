import {
  CursorPaginationDto,
  PagePaginationDto,
  UserPayloadDto,
} from '@app/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetPostsDto extends PagePaginationDto {}
