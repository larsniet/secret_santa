import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventPlan {
  FREE = 'FREE',
  GROUP = 'GROUP',
  BUSINESS = 'BUSINESS',
}

export const PLAN_LIMITS = {
  [EventPlan.FREE]: {
    maxParticipants: 10,
    maxEvents: 1,
    price: 0,
    features: ['Up to 10 participants', '1 active event', 'Basic features'],
  },
  [EventPlan.GROUP]: {
    maxParticipants: 30,
    maxEvents: 5,
    price: 4,
    features: [
      'Up to 30 participants',
      '5 active events',
      'All basic features',
      'Custom preferences',
      'Priority support',
    ],
  },
  [EventPlan.BUSINESS]: {
    maxParticipants: 100,
    maxEvents: 20,
    price: 10,
    features: [
      'Up to 100 participants',
      '20 active events',
      'All group features',
      'API access',
      'Dedicated support',
      'Custom branding',
    ],
  },
};

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, sparse: true })
  emailVerificationToken: string;

  @Prop({ type: Date })
  emailVerificationTokenExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
