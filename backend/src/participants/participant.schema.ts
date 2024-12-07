import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParticipantDocument = Participant & Document;

@Schema({ timestamps: true })
export class Participant {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  session: Types.ObjectId;

  @Prop()
  assignedTo?: string;

  @Prop({ type: Object, default: null })
  preferences?: {
    interests?: string;
    sizes?: string;
    wishlist?: string;
    restrictions?: string;
  };
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
