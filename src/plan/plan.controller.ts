import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async create(
    @Request() req: any,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
    @Body() createPlanDto: CreatePlanDto,
  ) {    
    const userId = req.user.sub;
    return this.planService.create(userId , createPlanDto,qr);
  }

  @Get()
  async findAll() {
    return this.planService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(TransactionInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.planService.update(id, updatePlanDto,qr);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.planService.remove(id);
  }
}
