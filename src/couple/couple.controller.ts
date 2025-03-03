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
  Request,
} from '@nestjs/common';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CoupleService } from './couple.service';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post('/connect/:partnerId')
  @ApiOperation({
    summary: '커플 연결',
    description: '커플 연결',
  })
  @UseInterceptors(TransactionInterceptor)
  async connectCouple(
    @Request() req: any,
    @Param('partnerId') partnerId: string,
    @QueryRunner() qr: QR,
  ) {
    const createCoupleDto: CreateCoupleDto = {
      myId: req.user.socialId,
      partnerId: partnerId,
    };

    return this.coupleService.connectCouple(createCoupleDto, qr);
  }

  @Post('/disconnect/:partnerId')
  @ApiOperation({
    summary: '커플 해제',
    description: '커플 해제',
  })
  @UseInterceptors(TransactionInterceptor)
  async disconnectCouple(
    @Request() req: any,
    @Param('partnerId') partnerId: string,
    @QueryRunner() qr: QR,
  ) {
    const createCoupleDto: CreateCoupleDto = {
      myId: req.user.socialId,
      partnerId: partnerId,
    };

    return this.coupleService.disConnectCouple(createCoupleDto, qr);
  }
}
