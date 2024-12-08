import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, SubscriptionPlan } from '../users/user.schema';
import { Session, SessionStatus } from '../sessions/session.schema';
import { Participant } from '../participants/participant.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const sessionModel = app.get<Model<Session>>(getModelToken(Session.name));
  const participantModel = app.get<Model<Participant>>(
    getModelToken(Participant.name),
  );

  // Create user
  const hashedPassword = await bcrypt.hash('thisisnotapassword', 10);
  const user = await userModel.create({
    name: 'Santa',
    email: 'santa@plansecretsanta.com',
    password: hashedPassword,
    subscriptionPlan: SubscriptionPlan.FREE,
    subscriptionExpiresAt: null,
  });

  const userId = user._id.toString();

  // Create session
  const session = await sessionModel.create({
    name: 'Family Christmas 2023',
    creator: new Types.ObjectId(userId),
    status: SessionStatus.ACTIVE,
    inviteCode: Math.random().toString(36).substring(2, 15),
  });

  const sessionId = session._id.toString();

  await participantModel.create({
    name: user.name,
    email: user.email,
    session: new Types.ObjectId(sessionId),
  });

  // Create 5 other participants
  const participants = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
    { name: 'Bob Wilson', email: 'bob@example.com' },
    { name: 'Alice Brown', email: 'alice@example.com' },
    { name: 'Charlie Davis', email: 'charlie@example.com' },
  ];

  await Promise.all(
    participants.map((p) =>
      participantModel.create({
        name: p.name,
        email: p.email,
        session: new Types.ObjectId(sessionId),
      }),
    ),
  );

  console.log('Seeding completed!');
  console.log('User created:', user.email);
  console.log('Session created:', session.name);
  console.log('6 participants added to the session');

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
