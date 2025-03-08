import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CoupleService } from './couple.service';
import { UserPayload } from '../auth/decorator/user-payload.decorator';
import { UserPayloadDto } from '@app/common/dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';

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

  // anniversary

  @Post('/anniversary')
  async createAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createAnniversaryDto: CreateAnniversaryDto,
  ) {
    return this.coupleService.createAnniversary(
      createAnniversaryDto,
      userPayload,
    );
  }

  @Get('/anniversaries')
  async getAnniversaries(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() getAnniversariesDto: GetAnniversariesDto,
  ) {
    return this.coupleService.getAnniversaries(
      getAnniversariesDto,
      userPayload,
    );
  }

  @Get('/anniversary')
  async getAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() getAnniversaryDto: GetAnniversaryDto,
  ) {
    return this.coupleService.getAnniversary(getAnniversaryDto, userPayload);
  }

  @Patch('/anniversary')
  async updateAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updateAnniversaryDto: UpdateAnniversaryDto,
  ) {
    return this.coupleService.updateAnniversary(
      updateAnniversaryDto,
      userPayload,
    );
  }

  @Delete('/anniversary')
  async deleteAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() getAnniversaryDto: GetAnniversaryDto,
  ) {
    return this.coupleService.deleteAnniversary(getAnniversaryDto, userPayload);
  }
  //
}
