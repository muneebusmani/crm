// import { ValidationPipe } from '@nestjs/common';
/** biome-ignore-all lint/correctness/useHookAtTopLevel: <explanation> */
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppLogger } from './common/logger.service';
import { LogLevel } from '@nestjs/common';
import { SupabaseStorageService } from './common/supabase-storage.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[],
    bodyParser: true,
  });
  const port = process.env.PORT ?? 3001;
  const host = process.env.HOST ?? '0.0.0.0';
  const frontend_url = process.env.FRONTEND_URL;
  const frontendUrl = frontend_url ?? 'http://localhost:3000';

  // Verify Supabase Storage bucket on startup
  try {
    const supabaseStorage = app.get(SupabaseStorageService);
    await supabaseStorage.verifyBucket();
  } catch {
    console.warn(
      '⚠️  Supabase Storage not configured. File uploads will use local storage.',
    );
  }

  app.setGlobalPrefix('api/v1');

  // Increase body size limit for file uploads (10MB)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

  app.useGlobalGuards(new JwtAuthGuard(app.get(ConfigService)));

  app.use(cookieParser());
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
