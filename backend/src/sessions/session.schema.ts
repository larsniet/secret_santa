import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventPlan } from '../users/user.schema';

export type SessionDocument = Session & Document;

export enum SessionStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  creator: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Participant' }] })
  participants: Types.ObjectId[];

  @Prop({ required: true, unique: true })
  inviteCode: string;

  @Prop({
    required: true,
    enum: Object.values(SessionStatus),
    default: SessionStatus.PENDING_PAYMENT,
  })
  status: SessionStatus;

  @Prop({
    required: true,
    type: String,
    enum: EventPlan,
    default: EventPlan.FREE,
  })
  plan: EventPlan;

  @Prop()
  completedAt?: Date;

  @Prop()
  paymentId?: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
