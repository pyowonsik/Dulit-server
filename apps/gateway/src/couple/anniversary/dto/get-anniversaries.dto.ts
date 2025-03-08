import { PagePaginationDto, UserPayloadDto } from '@app/common/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetAnniversariesDto extends PagePaginationDto {}
