import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { Session } from '../sessions/session.schema';
import { Participant } from '../participants/participant.schema';

async function cleanup() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const sessionModel = app.get<Model<Session>>(getModelToken(Session.name));
  const participantModel = app.get<Model<Participant>>(
    getModelToken(Participant.name),
  );

  // Delete all data
  await participantModel.deleteMany({});
  await sessionModel.deleteMany({});
  await userModel.deleteMany({});

  console.log('Cleanup completed!');
  console.log('All users, sessions, and participants have been deleted.');

  await app.close();
}

cleanup().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
