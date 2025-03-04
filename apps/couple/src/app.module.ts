import { Module } from '@nestjs/common';
import { CoupleModule } from './couple/couple.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlanModule } from './couple/plan/plan.module';
import { CalendarModule } from './couple/calendar/calendar.module';
import { AnniversaryModule } from './couple/anniversary/anniversary.module';
import * as Joi from 'joi';
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
      CoupleModule,
      PlanModule,
      CalendarModule,
      AnniversaryModule,
    ],
  })
  export class AppModule {}
  