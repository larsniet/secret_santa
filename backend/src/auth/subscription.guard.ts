import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PLAN_LIMITS, SubscriptionPlan } from '../users/user.schema';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) return false;

    const user = await this.usersService.findById(userId);
    const userPlan = PLAN_LIMITS[user.subscriptionPlan];

    // Check if subscription has expired
    if (
      user.subscriptionPlan !== SubscriptionPlan.FREE &&
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt < new Date()
    ) {
      // Revert to free plan if subscription expired
      await this.usersService.updateSubscription(userId, SubscriptionPlan.FREE);
      throw new ForbiddenException('Subscription has expired');
    }

    // Check active events limit
    const activeEvents =
      await this.sessionsService.getActiveSessionCount(userId);
    if (activeEvents >= userPlan.maxActiveEvents) {
      throw new ForbiddenException(
        `Your plan allows a maximum of ${userPlan.maxActiveEvents} active events`,
      );
    }

    // If creating/updating a session, check participants limit
    if (request.body?.participants?.length > userPlan.maxParticipants) {
      throw new ForbiddenException(
        `Your plan allows a maximum of ${userPlan.maxParticipants} participants`,
      );
    }

    return true;
  }
}
