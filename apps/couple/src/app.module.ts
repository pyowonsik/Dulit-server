import { Module } from '@nestjs/common';
import { CoupleModule } from './couple/couple.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ],
  })
  export class AppModule {}
  