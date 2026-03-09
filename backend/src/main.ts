import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

// Prevent Redis connection errors from crashing the process in dev
process.on('unhandledRejection', (reason: any) => {
  if (reason?.code === 'ECONNREFUSED' || reason?.message?.includes('ECONNREFUSED')) {
    console.warn('[WARN] Redis not available — background jobs disabled');
    return;
  }
  console.error('Unhandled rejection:', reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Travel Shop Algeria API')
    .setDescription('OTA Platform REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('search', 'Product search')
    .addTag('bookings', 'Booking management')
    .addTag('payments', 'Payment processing')
    .addTag('suppliers', 'Supplier management')
    .addTag('marketing', 'Marketing & campaigns')
    .addTag('loyalty', 'Loyalty program')
    .addTag('admin', 'Admin panel')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Travel Shop Algeria API running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
