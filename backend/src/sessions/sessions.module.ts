import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Session, SessionSchema } from './session.schema';
import { ParticipantsModule } from '../participants/participants.module';
import { SessionSchedulerService } from './session-scheduler.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    ScheduleModule.forRoot(),
    forwardRef(() => ParticipantsModule),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, SessionSchedulerService],
  exports: [SessionsService],
})
export class SessionsModule {}
