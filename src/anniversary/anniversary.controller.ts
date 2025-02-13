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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { IsAnniversaryCoupleOrAdmin } from './guard/is-anniversary-couple-or-admin.guard';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';

@Controller('/couple/anniversary')
@ApiTags('anniversary')
@ApiBearerAuth()
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  @Post()
  @ApiOperation({
    summary: '기념일 작성',
    description: '기념일 작성',
  })
  create(
    @UserId() userId: number,
    @Body() createAnniversaryDto: CreateAnniversaryDto,
  ) {
    return this.anniversaryService.create(userId, createAnniversaryDto);
  }

  @Get()
  @ApiOperation({
    summary: '전체 기념일 조회',
    description: '전체 기념일 조회',
  })
  findAll(@UserId() userId: number, @Query() dto: GetAnniversaryDto) {
    return this.anniversaryService.findAll(userId, dto);
  }

  @Get(':anniversaryId')
  @ApiOperation({
    summary: '단건 기념일 조회',
    description: '단건 기념일 조회',
  })
  findOne(
    @UserId() userId: number,
    @Param('anniversaryId', ParseIntPipe) id: number,
  ) {
    return this.anniversaryService.findOne(userId, id);
  }

  @Patch(':anniversaryId')
  @ApiOperation({
    summary: '기념일 수정',
    description: '기념일 수정',
  })
  @UseGuards(IsAnniversaryCoupleOrAdmin)
  update(
    @UserId() userId: number,
    @Param('anniversaryId', ParseIntPipe) id: number,
    @Body() updateAnniversaryDto: UpdateAnniversaryDto,
  ) {
    return this.anniversaryService.update(userId, id, updateAnniversaryDto);
  }

  @Delete(':anniversaryId')
  @ApiOperation({
    summary: '기념일 삭제',
    description: '기념일 삭제',
  })
  @UseGuards(IsAnniversaryCoupleOrAdmin)
  remove(
    @UserId() userId: number,
    @Param('anniversaryId', ParseIntPipe) id: number,
  ) {
    return this.anniversaryService.remove(userId, id);
  }
}
