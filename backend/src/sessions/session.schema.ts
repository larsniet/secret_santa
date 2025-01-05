import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

export enum SessionStatus {
  OPEN = 'open', // Initial state: people can join
  LOCKED = 'locked', // Assignments created: no more joins allowed
  COMPLETED = 'completed', // Event is over
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
    default: SessionStatus.OPEN,
  })
  status: SessionStatus;

  @Prop({ required: true, type: Number, min: 0 })
  budget: number;

  @Prop({ required: true, type: Date })
  registrationDeadline: Date;

  @Prop({ required: true, type: Date })
  giftExchangeDate: Date;

  @Prop({ required: true, type: String })
  timezone: string;

  @Prop()
  completedAt?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
