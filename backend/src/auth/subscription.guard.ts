import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { PLAN_LIMITS, EventPlan } from '../users/user.schema';

@Injectable()
export class EventLimitGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) return false;

    // Get active sessions count
    const activeEvents =
      await this.sessionsService.getActiveSessionCount(userId);
    const freeLimit = PLAN_LIMITS[EventPlan.FREE].maxParticipants;

    // If creating/updating a session, check participants limit
    if (request.body?.participants?.length > freeLimit) {
      throw new ForbiddenException(
        `Free plan allows a maximum of ${freeLimit} participants. Please upgrade your session to a paid plan.`,
      );
    }

    // Check active events limit for free plan (1 active event)
    if (activeEvents >= 1) {
      throw new ForbiddenException(
        'Free plan allows only 1 active event. Please upgrade to a paid plan for more events.',
      );
    }

    return true;
  }
}
