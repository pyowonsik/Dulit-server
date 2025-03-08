import { Module } from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { AnniversaryController } from './anniversary.controller';
import { Anniversary } from './entity/anniversary.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleService } from '../couple.service';
import { CoupleModule } from '../couple.module';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anniversary]),
    CoupleModule,
    CommonModule,
  ],
  controllers: [AnniversaryController],
  providers: [AnniversaryService],
})
export class AnniversaryModule {}
