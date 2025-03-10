import { CursorPaginationDto, PagePaginationDto } from '@app/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetCommentsDto extends PagePaginationDto {}
