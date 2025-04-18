import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Couple } from 'src/couple/entity/couple.entity';

@Module({
  imports: [
    // 순환 참조(Circular Dependency)
    // UserModule에서 NotificationModule 참조
    // NotificationModule에서 AuthModule 참조
    // AuthModule에서 UserModule,NotificationModule 참조
    forwardRef(() => AuthModule),
    // forwardRef(() => UserModule),
    TypeOrmModule.forFeature([User, Couple]),
  ],

  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
