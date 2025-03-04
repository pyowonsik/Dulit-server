import { Controller, Get } from '@nestjs/common';
import { CoupleService } from './couple.service';

@Controller()
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Get()
  getHello(): string {
    return this.coupleService.getHello();
  }
}
