import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Participant, ParticipantSchema } from './participant.schema';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
    ]),
    forwardRef(() => SessionsModule),
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
