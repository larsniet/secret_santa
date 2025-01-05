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

  @Prop({ type: Types.ObjectId, ref: 'Participant' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Object })
  preferences?: {
    interests: string; // e.g., "Books, Sports, Cooking"
    sizes: {
      clothing: string; // Standard clothing sizes: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | ''
      shoe: string; // Standard EU shoe sizes: '36'-'45' | ''
      ring: string; // Standard ring sizes: '5'-'10' | ''
    };
    wishlist: string; // Specific items the participant wants
    restrictions: string; // e.g., "No alcohol, No peanuts"
    ageGroup: string; // Defined groups: '0-12' | '13-19' | '20-29' | '30-49' | '50+'
    gender: string; // Defined options: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
  };
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
