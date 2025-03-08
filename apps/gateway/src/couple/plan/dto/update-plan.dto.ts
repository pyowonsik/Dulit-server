import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
