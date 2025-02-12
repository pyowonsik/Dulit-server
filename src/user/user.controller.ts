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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { UserId } from './decorator/user-id.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from './entity/user.entity';

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
  @RBAC(Role.admin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: '유저 조회',
    description: '유저 조회',
  })
  @RBAC(Role.admin)
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

  // 유저 정보 업데이트 필요 여부 확인후 진행.
  // @Patch(':id')
  // @RBAC(Role.admin)
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.userService.update(id, updateUserDto);
  // }

  @Delete('admin/:id')
  @ApiOperation({
    summary: '관리자 유저 삭제',
    description: '관리자 유저 삭제',
  })
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.admin)
  adminRemove(@Param('id', ParseIntPipe) id: number, @QueryRunner() qr: QR) {
    return this.userService.remove(id, qr);
  }

  @Delete('')
  @ApiOperation({
    summary: '본인 회원 탈퇴',
    description: '본인 회원 탈퇴',
  })
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.user)
  remove(@UserId() myId: number, @QueryRunner() qr: QR) {
    return this.userService.remove(myId, qr);
  }

  @Post('/admin/connect')
  @ApiOperation({
    summary: '어드민 커플 연결',
    description: '어드민 커플 연결',
  })
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.admin)
  async adminConnectCouple(
    @Body() createCoupleDto: CreateCoupleDto,
    @QueryRunner() qr: QR,
  ) {
    return this.userService.connectCouple(createCoupleDto, qr);
  }

  @Post('/connect/:partnerId')
  @ApiOperation({
    summary: '본인 커플 연결',
    description: '본인 커플 연결',
  })
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.user)
  async connectCouple(
    @Request() req: any,
    @Param('partnerId', ParseIntPipe) partnerId: number,
    @QueryRunner() qr: QR,
  ) {
    const createCoupleDto: CreateCoupleDto = {
      myId: `${req.user.socialId}`,
      partnerId: `${partnerId}`,
    };

    return this.userService.connectCouple(createCoupleDto, qr);
  }

  @Post('/admin/disconnect')
  @ApiOperation({
    summary: '어드민 커플 해제',
    description: '어드민 커플 해제',
  })
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  async adminDisconnectCouple(
    @Body() createCoupleDto: CreateCoupleDto,
    @QueryRunner() qr: QR,
  ) {
    return this.userService.disConnectCouple(createCoupleDto, qr);
  }

  @Post('/disconnect/:partnerId')
  @ApiOperation({
    summary: '유저 커플 해제',
    description: '유저 커플 해제',
  })
  @RBAC(Role.user)
  @UseInterceptors(TransactionInterceptor)
  async disconnectCouple(
    @Request() req: any,
    @Param('partnerId', ParseIntPipe) partnerId: number,
    @QueryRunner() qr: QR,
  ) {
    const createCoupleDto: CreateCoupleDto = {
      myId: `${req.user.socialId}`,
      partnerId: `${partnerId}`,
    };
    return this.userService.disConnectCouple(createCoupleDto, qr);
  }
}
