import { Module } from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { AnniversaryController } from './anniversary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Couple } from 'src/user/entity/couple.entity';
import { CommonModule } from 'src/common/common.module';
import { Anniversary } from './entity/anniversary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Anniversary]),CommonModule],
  controllers: [AnniversaryController],
  providers: [AnniversaryService],
})
export class AnniversaryModule {}
