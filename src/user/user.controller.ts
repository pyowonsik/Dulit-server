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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { Request } from 'express';
import { UserId } from './decorator/user-id.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: '유저 생성',
    description: '유저 생성',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: '유저 조회',
    description: '유저 조회',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '유저 단건 조회',
    description: '유저 단건 조회',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.userService.update(id, updateUserDto);
  // }

  @Delete(':id')
  @ApiOperation({
    summary: '유저 삭제',
    description: '유저 삭제',
  })
  @UseInterceptors(TransactionInterceptor)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.userService.remove(id, qr);
  }

  @Post('/connect')
  @ApiOperation({
    summary: '유저 커플 연결',
    description: '유저 커플 연결',
  })
  @UseInterceptors(TransactionInterceptor)
  async connectCouple(
    @Body() createCoupleDto: CreateCoupleDto,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.userService.connectCouple(createCoupleDto, qr);
  }

  @Post('/disconnect')
  @ApiOperation({
    summary: '유저 커플 연결 해제',
    description: '유저 커플 연결 해제',
  })
  @UseInterceptors(TransactionInterceptor)
  async disconnectCouple(
    @UserId() userId: number,
    @QueryRunner() qr: QR, // 트랜잭션 미적용을 감지하기 위한 데코레이터
  ) {
    return this.userService.disConnectCouple(userId, qr);
  }
}
