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

  @Get('me')
  @ApiOperation({
    summary: '내 유저 정보 조회',
    description: '내 유저 정보 조회',
  })
  @RBAC(Role.user)
  async getMe(@Request() req: any) {
    // console.log(req.user.sub);
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

  // 유저 정보 업데이트 필요 여부 확인후 진행.
  // @Patch(':id')
  // @RBAC(Role.admin)
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.userService.update(id, updateUserDto);
  // }

  @Delete('me')
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '회원 탈퇴',
  })
  @UseInterceptors(TransactionInterceptor)
  @RBAC(Role.user)
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

  @Post('/connect/:partnerId')
  @ApiOperation({
    summary: '커플 연결',
    description: '커플 연결',
  })
  @UseInterceptors(TransactionInterceptor)
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

  @Post('/disconnect/:partnerId')
  @ApiOperation({
    summary: '커플 해제',
    description: '커플 해제',
  })
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
