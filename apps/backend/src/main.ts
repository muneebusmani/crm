import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;
  const host = process.env.HOST ?? '0.0.0.0';
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalGuards(new JwtAuthGuard(app.get(ConfigService)));

  app.use(cookieParser());
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(port, host);
  console.log(`Listening on ${host}:${port}`);
}
bootstrap();
