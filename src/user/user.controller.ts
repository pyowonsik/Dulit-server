import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { UserId } from './decorator/user-id.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from './entity/user.entity';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: '유저 조회',
    description: '유저 조회',
  })
  @RBAC(Role.admin)
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: '내 유저 정보 조회',
    description: '내 유저 정보 조회',
  })
  @RBAC(Role.user)
  async getMe(@Request() req: any) {
    return this.userService.findOne(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: '유저 단건 조회',
    description: '유저 단건 조회',
  })
  @RBAC(Role.admin)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get('/partner/:partnerId')
  @ApiOperation({
    summary: '상대방 유저 조회',
    description: '상대방 유저 조회',
  })
  findPartnerById(@Param('partnerId', ParseIntPipe) partnerId: number) {
    return this.userService.findPartnerById(partnerId);
  }

  @Delete('me')
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '회원 탈퇴',
  })
  @UseInterceptors(TransactionInterceptor)
  removeMe(@UserId() myId: number, @QueryRunner() qr: QR) {
    return this.userService.remove(myId, qr);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '관리자 유저 삭제',
    description: '관리자 유저 삭제',
  })
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number, @QueryRunner() qr: QR) {
    return this.userService.remove(id, qr);
  }
}
