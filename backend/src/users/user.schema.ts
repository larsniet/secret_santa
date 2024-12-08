import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SubscriptionPlan {
  FREE = 'Free',
  GROUP = 'Group',
  BUSINESS = 'Business',
}

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscriptionPlan: SubscriptionPlan;

  @Prop()
  subscriptionExpiresAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxParticipants: 15,
    maxActiveEvents: 1,
    features: ['basic_matching', 'email_notifications', 'preferences'],
  },
  [SubscriptionPlan.GROUP]: {
    maxParticipants: 50,
    maxActiveEvents: 3,
    features: [
      'smart_matching',
      'custom_themes',
      'preferences',
      'budget_setting',
    ],
  },
  [SubscriptionPlan.BUSINESS]: {
    maxParticipants: Infinity,
    maxActiveEvents: 10,
    features: [
      'advanced_matching',
      'custom_branding',
      'preferences',
      'budget_management',
      'priority_support',
    ],
  },
};
