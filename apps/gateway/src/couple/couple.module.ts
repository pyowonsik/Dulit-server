import { Module } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';

@Module({
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
