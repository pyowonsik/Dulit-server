import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { IsPlanCoupleOrAdminGuard } from './guard/is-plan-couple-or-admin.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPlanDto } from './dto/get-plan.dto';
import { UserId } from 'src/user/decorator/user-id.decorator';

@Controller('/couple/plan')
@ApiTags('plan')
@ApiBearerAuth()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @ApiOperation({
    summary: '약속 생성',
    description: '약속 생성',
  })
  @UseInterceptors(TransactionInterceptor)
  async create(
    @UserId() userId: number,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
    @Body() createPlanDto: CreatePlanDto,
  ) {
    return this.planService.create(userId, createPlanDto, qr);
  }

  @Get()
  @ApiOperation({
    summary: '전체 약속 조회',
    description: '전체 약속 조회',
  })
  async findAll(@UserId() userId: number, @Query() dto: GetPlanDto) {
    return this.planService.findAll(userId, dto);
  }

  @Get(':planId')
  @ApiOperation({
    summary: '약속 단건 조회',
    description: '약속 단건 조회',
  })
  async findOne(
    @UserId() userId: number,
    @Param('planId', ParseIntPipe) id: number,
  ) {
    return this.planService.findOne(userId, id);
  }

  @Patch(':planId')
  @ApiOperation({
    summary: '약속 수정',
    description: '약속 수정',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsPlanCoupleOrAdminGuard)
  async update(
    @UserId() userId: number,

    @Param('planId', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.planService.update(userId, id, updatePlanDto, qr);
  }

  @Delete(':planId')
  @ApiOperation({
    summary: '약속 삭제',
    description: '약속 삭제',
  })
  @UseGuards(IsPlanCoupleOrAdminGuard)
  async remove(
    @UserId() userId: number,
    @Param('planId', ParseIntPipe) id: number,
  ) {
    return this.planService.remove(userId, id);
  }
}
