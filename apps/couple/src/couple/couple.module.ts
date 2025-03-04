import { Module } from '@nestjs/common';
import { CoupleController } from './couple.controller';
import { CoupleService } from './couple.service';
import { Couple } from './entity/couple.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Couple])],
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
