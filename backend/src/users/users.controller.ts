import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { PLAN_LIMITS } from './user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.userId);
  }

  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() updateData: { name?: string; email?: string },
  ) {
    const user = await this.usersService.updateProfile(
      req.user.userId,
      updateData,
    );
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  @Patch('me/password')
  async updatePassword(
    @Request() req,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.updatePassword(
      req.user.userId,
      passwordData.currentPassword,
      passwordData.newPassword,
    );
    return { message: 'Password updated successfully' };
  }

  @Get('me/subscription')
  async getSubscription(@Request() req) {
    const { plan, expiresAt } = await this.usersService.getSubscriptionDetails(
      req.user.userId,
    );
    return {
      planName: plan,
      features: PLAN_LIMITS[plan].features,
      maxParticipants: PLAN_LIMITS[plan].maxParticipants,
      maxActiveEvents: PLAN_LIMITS[plan].maxActiveEvents,
      expiresAt,
    };
  }

  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.usersService.deleteAccount(req.user.userId);
    return { message: 'Account deleted successfully' };
  }
}
