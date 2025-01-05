import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';
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
    isEmailVerified: true,
    password: hashedPassword,
  });

  // Create unverified test user
  await userModel.create({
    name: 'Test User',
    email: 'test@test.com',
    password: hashedPassword,
    isEmailVerified: false,
    emailVerificationToken: 'test-token',
    emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  });

  const userId = user._id.toString();

  // Create session using the service
  const session = (await sessionsService.createSession(userId, {
    name: 'Family Christmas 2023',
    budget: 100,
    registrationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    giftExchangeDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  })) as Session & { _id: Types.ObjectId };
  session.status = SessionStatus.OPEN;
  await sessionModel.updateOne(
    { _id: session._id },
    { status: SessionStatus.OPEN },
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
        sizes: {
          clothing: 'L',
          shoe: '42',
          ring: '9',
        },
        wishlist: 'A new camera lens or hiking boots',
        restrictions: 'No food items please',
        ageGroup: '26-35',
        gender: 'Male',
      },
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      preferences: {
        interests: 'Cooking, gardening, and yoga',
        sizes: {
          clothing: 'M',
          shoe: '38',
          ring: '7',
        },
        wishlist: 'Kitchen gadgets or yoga accessories',
        restrictions: 'No scented items',
        ageGroup: '36-45',
        gender: 'Female',
      },
    },
    { name: 'Bob Wilson', email: 'bob@example.com' },
    {
      name: 'Alice Brown',
      email: 'alice@example.com',
      preferences: {
        interests: 'Art, music, and travel',
        sizes: {
          clothing: 'S',
          shoe: '37',
          ring: '6',
        },
        wishlist: 'Art supplies or travel accessories',
        restrictions: 'None',
        ageGroup: '20-29',
        gender: 'Female',
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

  console.log('Seed completed successfully');
  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
