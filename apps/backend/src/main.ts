// import { ValidationPipe } from '@nestjs/common';
/** biome-ignore-all lint/correctness/useHookAtTopLevel: <explanation> */
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppLogger } from './common/logger.service';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[],
  });
  const port = process.env.PORT ?? 3001;
  const host = process.env.HOST ?? '0.0.0.0';
  const frontend_url = process.env.FRONTEND_URL;
  const frontendUrl = frontend_url ?? 'http://localhost:3000';

  app.setGlobalPrefix('api/v1');

  const appLogger = app.get(AppLogger);
  app.useLogger(appLogger); // 👈 tell Nest to use it
  //Swagger
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );
  // app.useGlobalPipes(new ZodValidationPipe());

  app.use(cookieParser());

  // Debug middleware to log cookies on every request
  app.use((req, _res, next) => {
    console.log('\n🌐 [Request] ===========================');
    console.log('📍 [Request] URL:', req.method, req.url);
    console.log('🍪 [Request] Cookies received:', req.cookies);
    console.log(
      '🔑 [Request] Auth header:',
      req.headers.authorization || 'Not present',
    );
    console.log('🌍 [Request] Origin:', req.headers.origin || 'Not present');
    console.log(
      '🍪 [Request] Cookie header:',
      req.headers.cookie || 'Not present',
    );
    console.log('==========================================\n');
    next();
  });

  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.enableCors({
    origin: frontend_url,
    methods: 'GET,POST,DELETE,PUT',
    credentials: true,
  });
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads')), // points to backend/uploads
  );
  await app.listen(port, host);
  console.log(frontend_url);
  console.log(`Listening on ${host}:${port}`);
}
bootstrap();
