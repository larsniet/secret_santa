import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';
import { EventPlan } from '../users/user.schema';
import { Participant } from '../participants/participant.schema';
import { SessionsService } from '../sessions/sessions.service';
import { Session, SessionStatus } from '../sessions/session.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const participantModel = app.get<Model<Participant>>(
    getModelToken(Participant.name),
  );
  const sessionsService = app.get(SessionsService);
  const sessionModel = app.get<Model<Session>>(getModelToken(Session.name));

  // Create user
  const hashedPassword = await bcrypt.hash('thisisnotapassword', 10);
  const user = await userModel.create({
    name: 'Santa',
    email: 'santa@plansecretsanta.com',
    password: hashedPassword,
  });

  const userId = user._id.toString();

  // Create session using the service
  const session = (await sessionsService.createSession(userId, {
    name: 'Family Christmas 2023',
    plan: EventPlan.GROUP,
  })) as Session & { _id: Types.ObjectId };
  session.status = SessionStatus.ACTIVE;
  await sessionModel.updateOne(
    { _id: session._id },
    { status: SessionStatus.ACTIVE },
  );
  const sessionId = session._id.toString();

  // Create first participant (the creator)
  const firstParticipant = await participantModel.create({
    name: user.name,
    email: user.email,
    session: new Types.ObjectId(sessionId),
  });

  // Create 5 other participants
  const participants = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        interests: 'Books, hiking, and photography',
        sizes: 'L for shirts, 32/34 for pants',
        wishlist: 'A new camera lens or hiking boots',
        restrictions: 'No food items please',
      },
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      preferences: {
        interests: 'Cooking, gardening, and yoga',
        sizes: 'M for tops, 8 for dresses',
        wishlist: 'Kitchen gadgets or yoga accessories',
        restrictions: 'No scented items',
      },
    },
    { name: 'Bob Wilson', email: 'bob@example.com' },
    {
      name: 'Alice Brown',
      email: 'alice@example.com',
      preferences: {
        interests: 'Art, music, and travel',
        sizes: 'S for clothing',
        wishlist: 'Art supplies or travel accessories',
        restrictions: 'None',
      },
    },
    { name: 'Charlie Davis', email: 'charlie@example.com' },
  ];

  const createdParticipants = await Promise.all(
    participants.map((p) =>
      participantModel.create({
        name: p.name,
        email: p.email,
        session: new Types.ObjectId(sessionId),
        preferences: p.preferences || null,
      }),
    ),
  );

  // Add all participants to the session
  await sessionModel.updateOne(
    { _id: session._id },
    {
      $set: {
        participants: [
          firstParticipant._id,
          ...createdParticipants.map((p) => p._id),
        ],
      },
    },
  );

  await participantModel.updateMany(
    { session: new Types.ObjectId(sessionId) },
    { $set: { isActive: true } },
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
