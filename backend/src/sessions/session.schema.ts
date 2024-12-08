import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

export enum SessionStatus {
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
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Prop()
  completedAt?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
