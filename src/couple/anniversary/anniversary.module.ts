import { Module } from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { AnniversaryController } from './anniversary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Anniversary } from './entity/anniversary.entity';
import { Couple } from 'src/couple/entity/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Anniversary]),CommonModule],
  controllers: [AnniversaryController],
  providers: [AnniversaryService],
})
export class AnniversaryModule {}
