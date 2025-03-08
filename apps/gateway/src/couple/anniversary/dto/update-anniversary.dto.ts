import { PartialType } from '@nestjs/swagger';
import { CreateAnniversaryDto } from './create-anniversary.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAnniversaryDto extends PartialType(CreateAnniversaryDto) {}
