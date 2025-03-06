import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CoupleService } from './couple.service';
import { Authorization } from 'apps/user/src/auth/decorator/authorization.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { RpcInterceptor } from '@app/common';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  // @Post('/connect')
  // @UsePipes(ValidationPipe)
  // async connectCouple(
  //   @Authorization() token: string,
  //   @Body() createCoupleDto: CreateCoupleDto,
  // ) {
  //   return this.coupleService.connectCouple(token, createCoupleDto);
  // }

  @MessagePattern({ cmd: 'connect_couple' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async createCouple(@Payload() connectCoupleDto: ConnectCoupleDto) {
    return this.coupleService.connectCouple(connectCoupleDto);
  }
}
