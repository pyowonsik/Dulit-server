import { Module } from '@nestjs/common';
import { CoupleModule } from './couple/couple.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlanModule } from './couple/plan/plan.module';
import { CalendarModule } from './couple/calendar/calendar.module';
import { AnniversaryModule } from './couple/anniversary/anniversary.module';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CHAT_SERVICE, USER_SERVICE } from '@app/common';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        DB_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow('DB_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // 통신할 MS 정의
    ClientsModule.registerAsync({
      clients: [
        {
          name: USER_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.getOrThrow<string>('USER_HOST'),
              port: configService.getOrThrow<number>('USER_TCP_PORT'),
            },
          }),
          inject: [ConfigService],
        },
        {
          name: CHAT_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.getOrThrow<string>('CHAT_HOST'),
              port: configService.getOrThrow<number>('CHAT_TCP_PORT'),
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    CoupleModule,
    PlanModule,
    CalendarModule,
    AnniversaryModule,
  ],
})
export class AppModule {}
