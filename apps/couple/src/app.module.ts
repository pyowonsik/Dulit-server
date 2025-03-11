import { Module } from '@nestjs/common';
import { CoupleModule } from './couple/couple.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlanModule } from './couple/plan/plan.module';
import { CalendarModule } from './couple/calendar/calendar.module';
import { AnniversaryModule } from './couple/anniversary/anniversary.module';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CHAT_SERVICE, NOTIFICATION_SERVICE, USER_SERVICE } from '@app/common';
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
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbitmq:5672'],
              queue: 'user_queue',
              queueOptions: {
                durable: false,
              },
            },
          }),
          inject: [ConfigService],
        },
        {
          name: CHAT_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbitmq:5672'],
              queue: 'chat_queue',
              queueOptions: {
                durable: false,
              },
            },
          }),
          inject: [ConfigService],
        },
        {
          name: NOTIFICATION_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbitmq:5672'],
              queue: 'notification_queue',
              queueOptions: {
                durable: false,
              },
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
