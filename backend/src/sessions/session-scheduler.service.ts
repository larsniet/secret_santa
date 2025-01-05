import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionStatus } from './session.schema';

@Injectable()
export class SessionSchedulerService {
  private readonly logger = new Logger(SessionSchedulerService.name);

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  private getDateInTimezone(date: Date, timezone: string): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSessionStateTransitions() {
    const now = new Date();

    try {
      // Get all OPEN sessions
      const openSessions = await this.sessionModel.find({
        status: SessionStatus.OPEN,
      });

      // Check each session's deadline in its own timezone
      for (const session of openSessions) {
        const deadlineInTz = this.getDateInTimezone(
          session.registrationDeadline,
          session.timezone,
        );
        if (deadlineInTz <= now) {
          await this.sessionModel.updateOne(
            { _id: session._id },
            { $set: { status: SessionStatus.LOCKED } },
          );
          this.logger.debug(
            `Session ${session._id} locked due to deadline in ${session.timezone}`,
          );
        }
      }

      // Get all LOCKED sessions
      const lockedSessions = await this.sessionModel.find({
        status: SessionStatus.LOCKED,
      });

      // Check each session's gift exchange date in its own timezone
      for (const session of lockedSessions) {
        const exchangeDateInTz = this.getDateInTimezone(
          session.giftExchangeDate,
          session.timezone,
        );
        const oneDayAfter = new Date(exchangeDateInTz);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);

        if (now >= oneDayAfter) {
          await this.sessionModel.updateOne(
            { _id: session._id },
            {
              $set: {
                status: SessionStatus.COMPLETED,
                completedAt: now,
              },
            },
          );
          this.logger.debug(
            `Session ${session._id} completed in ${session.timezone}`,
          );
        }
      }

      this.logger.debug('Session state transitions completed successfully');
    } catch (error) {
      this.logger.error('Error during session state transitions:', error);
    }
  }
}
