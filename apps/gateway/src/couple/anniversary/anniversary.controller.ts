import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserPayloadDto } from '@app/common/dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { AnniversaryService } from './anniversary.service';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { UserPayload } from '../../auth/decorator/user-payload.decorator';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';
import { IsAnniversaryCoupleOrAdmin } from './guard/is-anniversary-couple-or-admin.guard';

@Controller('couple')
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  @Post('/anniversary')
  async createAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() createAnniversaryDto: CreateAnniversaryDto,
  ) {
    return this.anniversaryService.createAnniversary(
      createAnniversaryDto,
      userPayload,
    );
  }

  @Get('/anniversaries')
  async getAnniversaries(
    @UserPayload() userPayload: UserPayloadDto,
    @Query() getAnniversariesDto: GetAnniversariesDto,
  ) {
    return this.anniversaryService.getAnniversaries(
      getAnniversariesDto,
      userPayload,
    );
  }

  @Get('/anniversary/:anniversaryId')
  async getAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('anniversaryId') anniversaryId: string,
  ) {
    return this.anniversaryService.getAnniversary(userPayload, anniversaryId);
  }

  @Patch('/anniversary/:anniversaryId')
  @UseGuards(IsAnniversaryCoupleOrAdmin)
  async updateAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Body() updateAnniversaryDto: UpdateAnniversaryDto,
    @Param('anniversaryId') anniversaryId: string,
  ) {
    return this.anniversaryService.updateAnniversary(
      updateAnniversaryDto,
      userPayload,
      anniversaryId,
    );
  }

  @Delete('/anniversary/:anniversaryId')
  @UseGuards(IsAnniversaryCoupleOrAdmin)
  async deleteAnniversary(
    @UserPayload() userPayload: UserPayloadDto,
    @Param('anniversaryId') anniversaryId: string,
  ) {
    return this.anniversaryService.deleteAnniversary(
      userPayload,
      anniversaryId,
    );
  }
  //
}
