import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not in DTO
      forbidNonWhitelisted: true, // Throws error if extra properties
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );
  app.useGlobalGuards(new JwtAuthGuard(app.get(ConfigService)));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
