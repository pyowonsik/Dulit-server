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
// import { IsAnniversaryCoupleOrAdmin } from './guard/is-anniversary-couple-or-admin.guard';

// coupleId req로 찾기

@Controller('/couple/:coupleId/anniversary')
@ApiTags('anniversary')
@ApiBearerAuth()
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  @Post()
  create(
    @Param('coupleId', ParseIntPipe) coupleId: number,
    @Body() createAnniversaryDto: CreateAnniversaryDto,
  ) {
    return this.anniversaryService.create(coupleId, createAnniversaryDto);
  }

  @Get()
  findAll(
    @Param('coupleId', ParseIntPipe) coupleId: number,
    @Query() dto: GetAnniversaryDto,
  ) {
    return this.anniversaryService.findAll(dto, coupleId);
  }

  @Get(':anniversaryId')
  findOne(
    @Param('coupleId', ParseIntPipe) coupleId: number,
    @Param('anniversaryId', ParseIntPipe) id: number,
  ) {
    return this.anniversaryService.findOne(coupleId, id);
  }

  @Patch(':anniversaryId')
  // @UseGuards(IsAnniversaryCoupleOrAdmin)
  update(
    @Param('coupleId', ParseIntPipe) coupleId: number,
    @Param('anniversaryId', ParseIntPipe) id: number,
    @Body() updateAnniversaryDto: UpdateAnniversaryDto,
  ) {
    return this.anniversaryService.update(coupleId, id, updateAnniversaryDto);
  }

  @Delete(':anniversaryId')
  // @UseGuards(IsAnniversaryCoupleOrAdmin)
  remove(
    @Param('coupleId', ParseIntPipe) coupleId: number,
    @Param('anniversaryId', ParseIntPipe) id: number,
  ) {
    return this.anniversaryService.remove(coupleId, id);
  }
}
