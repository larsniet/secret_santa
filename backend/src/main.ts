import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure raw body parsing for Stripe webhooks
  app.use(
    '/api/subscriptions/webhook',
    express.raw({ type: 'application/json' }),
  );

  // Regular JSON body parser for other routes
  app.use(express.json());

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5001);
}
bootstrap();
