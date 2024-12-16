import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EmailService } from './email/email.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);

  try {
    // await emailService.sendApologyEmail();
    console.log('Apology emails sent successfully!');
  } catch (error) {
    console.error('Error sending apology emails:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
