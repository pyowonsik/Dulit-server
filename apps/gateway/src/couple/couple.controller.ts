import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { UserPayload } from '../auth/decorator/user-payload.decorator';
import { UserPayloadDto } from '@app/common/dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post('/connect')
  async connectCouple(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() connectCoupleDto: ConnectCoupleDto,
  ) {
    return this.coupleService.connectCouple(connectCoupleDto, userPayload);
  }
}
