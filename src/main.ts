import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });

  // CORS 설정 - localhost:3000에서 오는 요청만 허용
  app.enableCors({
    origin: 'http://localhost:3000',
  });
  //

  // swagger doc 셋팅
  const config = new DocumentBuilder()
    .setTitle('Dulit')
    .setDescription('대한민국 대표 커플 메신저 Dulit')
    .setVersion('1.0')
    // .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // swagger 인증 정보 저장
    },
  });
  //

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      // DTO 정의하지 않은 property를 숨김
      whitelist: true,
      // DTO 정의하지 않은 property일때, Error
      forbidNonWhitelisted: true,
      // postMan에서 보내는 데이터 타입 transform
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
