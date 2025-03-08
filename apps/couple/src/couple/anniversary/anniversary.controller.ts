import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';

@Controller()
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  @MessagePattern({
    cmd: 'create_anniversary',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  createAnniversary(@Payload() payload: CreateAnniversaryDto) {
    return this.anniversaryService.createAnniversary(payload);
  }

  @MessagePattern({
    cmd: 'get_anniversary',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getAnniversary(@Payload() payload: GetAnniversaryDto) {
    return this.anniversaryService.getAnniversary(payload);
  }

  @MessagePattern({
    cmd: 'get_anniversaries',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getAnniversaries(@Payload() payload: GetAnniversariesDto) {
    return this.anniversaryService.getAnniversaries(payload);
  }

  @MessagePattern({
    cmd: 'update_anniversary',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  updateAnniversary(@Payload() payload: UpdateAnniversaryDto) {
    return this.anniversaryService.updateAnniversary(payload);
  }

  @MessagePattern({
    cmd: 'delete_anniversary',
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  deleteAnniversary(@Payload() payload: GetAnniversaryDto) {
    return this.anniversaryService.deleteAnniversary(payload);
  }
}
