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
  UseGuards,
  Query,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { IsPlanMineOrAdminGuard } from './guard/is-plan-couple-or-admin.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPlanDto } from './dto/get-plan.dto';
import { UserId } from 'src/user/decorator/user-id.decorator';

@Controller('plan')
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
    @Request() req: any,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
    @Body() createPlanDto: CreatePlanDto,
  ) {
    const userId = req.user.sub;
    return this.planService.create(userId, createPlanDto, qr);
  }

  @Get()
  @ApiOperation({
    summary: '전체 약속 조회',
    description: '전체 약속 조회',
  })
  async findAll(@Query() dto: GetPlanDto, @UserId() userId: number) {
    return this.planService.findAll(userId,dto);
  }

  @Get(':planId')
  @ApiOperation({
    summary: '약속 단건 조회',
    description: '약속 단건 조회',
  })
  async findOne(@Param('planId', ParseIntPipe) id: number) {
    return this.planService.findOne(id);
  }

  @Patch(':planId')
  @ApiOperation({
    summary: '약속 수정',
    description: '약속 수정',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsPlanMineOrAdminGuard)
  async update(
    @Param('planId', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.planService.update(id, updatePlanDto, qr);
  }

  @Delete(':planId')
  @ApiOperation({
    summary: '약속 삭제',
    description: '약속 삭제',
  })
  @UseGuards(IsPlanMineOrAdminGuard)
  async remove(@Param('planId', ParseIntPipe) id: number) {
    return this.planService.remove(id);
  }
}
