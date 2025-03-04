import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envVariableKeys } from './common/const/env.const';
import { UserModule } from './user/user.module';
import { User } from './user/entity/user.entity';
import { BearerTokenMiddleWare } from './auth/middleware/bearer-token.middleware';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entity/chat.entity';
import { ChatRoom } from './chat/entity/chat-room.entity';
import { PostModule } from './post/post.module';
import { Post } from './post/entity/post.entity';
import { CommonModule } from './common/common.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';
import { CommentModel } from './post/comment/entity/comment.entity';
import { PostUserLike } from './post/comment/entity/post-user-like.entity';
import { RBACGuard } from './auth/guard/rbac.guard';
import { ForbiddenExceptionFilter } from './common/filter/forbidden.filter';
import { QueryFailedExceptionFilter } from './common/filter/query-failed.filter';
import { WinstonModule } from 'nest-winston';
import { CoupleModule } from './couple/couple.module';
import * as winston from 'winston';
import { Couple } from './couple/entity/couple.entity';
import { Plan } from './couple/plan/entities/plan.entity';
import { Anniversary } from './couple/anniversary/entity/anniversary.entity';
import { Calendar } from './couple/calendar/entities/calendar.entity';
import { CalendarModule } from './couple/calendar/calendar.module';
import { AnniversaryModule } from './couple/anniversary/anniversary.module';
import { PlanModule } from './couple/plan/plan.module';

@Module({
  imports: [
    // DB 정보 환경 변수 적용
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CLIENT_SECRET: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        NAVER_CLIENT_ID: Joi.string().required(),
        NAVER_CLIENT_SECRET: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    // TypeORM 적용
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'postgres',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDataBase),
        entities: [
          User,
          Chat,
          ChatRoom,
          Couple,
          Post,
          Plan,
          CommentModel,
          PostUserLike,
          Anniversary,
          Calendar,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // files 내부 파일 접근 : public 요청시 반드시 /public/ 붙여서 요청해야함.
    // -> files/uuid~~ 로 요청하게 되면 url이 겹치기 때문에(Not Found Exception 발생) public/files/uuid ~~ 로 요청하도록 하기 위함
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public/',
    }),
    // Cron 작업 설정
    ScheduleModule.forRoot(),
    // Winston Logger 설정
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({
              all: true,
            }),
            winston.format.timestamp(),
            winston.format.printf(
              (info) =>
                `${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
            ),
          ),
        }),
        new winston.transports.File({
          dirname: join(process.cwd(), 'logs'),
          filename: 'logs.log',
          format: winston.format.combine(
            // winston.format.colorize({
            //   all: true,
            // }),
            winston.format.timestamp(),
            winston.format.printf(
              (info) =>
                `${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
            ),
          ),
        }),
      ],
    }),
    AuthModule,
    UserModule,
    JwtModule.register({}),
    ChatModule,
    PostModule,
    CommonModule,
    PlanModule,
    NotificationModule,
    AnniversaryModule,
    CalendarModule,
    CoupleModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
  ],
})

// MiddleWear 적용
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleWare)
      .exclude(
        {
          path: 'auth/register',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/kakao',
          method: RequestMethod.GET,
        },
        {
          path: 'auth/kakao/callback',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('*');
  }
}
