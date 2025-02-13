import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetAnniversaryDto } from './dto/get-anniverasry.dto';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { IsAnniversaryCoupleOrAdmin } from './guard/is-anniversary-couple-or-admin.guard';
// import { IsAnniversaryCoupleOrAdmin } from './guard/is-anniversary-couple-or-admin.guard';


@Controller('/couple/anniversary')
@ApiTags('anniversary')
@ApiBearerAuth()
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  @Post()
  create(
    @UserId() userId: number,
    @Body() createAnniversaryDto: CreateAnniversaryDto,
  ) {
    return this.anniversaryService.create(userId, createAnniversaryDto);
  }

  @Get()
  findAll(@UserId() userId: number, @Query() dto: GetAnniversaryDto) {
    return this.anniversaryService.findAll(userId, dto);
  }

  @Get(':anniversaryId')
  findOne(
 @UserId() userId: number, 
    @Param('anniversaryId', ParseIntPipe) id: number,
  ) {
    return this.anniversaryService.findOne(userId, id);
  }

  @Patch(':anniversaryId')
  @UseGuards(IsAnniversaryCoupleOrAdmin)
  update(
    @UserId() userId: number, 
    @Param('anniversaryId', ParseIntPipe) id: number,
    @Body() updateAnniversaryDto: UpdateAnniversaryDto,
  ) {
    return this.anniversaryService.update(userId, id, updateAnniversaryDto);
  }

  @Delete(':anniversaryId')
  @UseGuards(IsAnniversaryCoupleOrAdmin)
  remove(
    @UserId() userId: number, 
    @Param('anniversaryId', ParseIntPipe) id: number,
  ) {
    return this.anniversaryService.remove(userId, id);
  }
}
