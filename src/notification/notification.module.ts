import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { Couple } from 'src/user/entity/couple.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User,Couple])],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway,NotificationService],
})
export class NotificationModule {}
