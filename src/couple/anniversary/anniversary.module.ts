import { Module } from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';
import { AnniversaryController } from './anniversary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Anniversary } from './entity/anniversary.entity';
import { Couple } from 'src/couple/entity/couple.entity';
import { CoupleService } from '../couple.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Couple, Anniversary]),CommonModule,NotificationModule],
  controllers: [AnniversaryController],
  providers: [AnniversaryService,CoupleService],
})
export class AnniversaryModule {}
