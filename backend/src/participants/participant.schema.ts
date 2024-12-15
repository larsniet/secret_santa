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
    interests?: string[]; // e.g., ["Books", "Sports", "Cooking"]
    sizes?: {
      clothing?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; // Standard clothing sizes
      shoe?:
        | '36'
        | '37'
        | '38'
        | '39'
        | '40'
        | '41'
        | '42'
        | '43'
        | '44'
        | '45'; // Standard EU shoe sizes
      ring?: '5' | '6' | '7' | '8' | '9' | '10'; // Standard ring sizes
    };
    wishlist?: string[]; // Specific items the participant wants
    restrictions?: string[]; // e.g., ["No alcohol", "No peanuts"]
    ageGroup?: '18-25' | '26-35' | '36-45' | '46-55' | '56+'; // Defined groups
    gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'; // Defined options
    favoriteColors?: string[]; // e.g., ["Red", "Blue", "Green"]
    dislikes?: string[]; // e.g., ["Socks", "Candles"]
    hobbies?: string[]; // e.g., ["Cycling", "Painting", "Gardening"]
  };
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
