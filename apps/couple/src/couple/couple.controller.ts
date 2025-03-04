import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { Authorization } from 'apps/user/src/auth/decorator/authorization.decorator';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post('/connect/:partnerId')
  @UsePipes(ValidationPipe)
  async connectCouple(
    @Authorization() token: string,
    @Param('partnerId') partnerId: string,
  ) {
    return this.coupleService.connectCouple(token, partnerId);
  }
}
