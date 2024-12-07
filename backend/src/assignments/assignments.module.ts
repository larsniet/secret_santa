import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { ParticipantsModule } from '../participants/participants.module';
import { EmailModule } from '../email/email.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [ParticipantsModule, EmailModule, SessionsModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
