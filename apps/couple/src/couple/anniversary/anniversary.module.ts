import { Module } from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { AnniversaryController } from './anniversary.controller';

@Module({
  controllers: [AnniversaryController],
  providers: [AnniversaryService],
})
export class AnniversaryModule {}
