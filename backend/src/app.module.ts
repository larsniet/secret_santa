import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantsModule } from './participants/participants.module';
import { EmailModule } from './email/email.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    SessionsModule,
    ParticipantsModule,
    EmailModule,
    AssignmentsModule,
    UsersModule,
  ],
})
export class AppModule {}
