import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, SubscriptionPlan } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel('Session') private sessionModel: Model<any>,
    @InjectModel('Participant') private participantModel: Model<any>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateData: { name?: string; email?: string },
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // If email is being updated, check if it's already in use
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateData.email })
        .exec();
      if (existingUser) {
        throw new UnauthorizedException('Email already in use');
      }
    }

    Object.assign(user, updateData);
    return user.save();
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async updateSubscription(
    userId: string,
    plan: SubscriptionPlan,
    expiresAt?: Date,
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    user.subscriptionPlan = plan;
    user.subscriptionExpiresAt = expiresAt;
    return user.save();
  }

  async getSubscriptionDetails(userId: string): Promise<{
    plan: SubscriptionPlan;
    expiresAt?: Date;
  }> {
    const user = await this.findById(userId);
    return {
      plan: user.subscriptionPlan,
      expiresAt: user.subscriptionExpiresAt,
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get all sessions created by the user
    const sessions = await this.sessionModel.find({ creator: userId }).exec();

    // Delete participants first
    for (const session of sessions) {
      await this.participantModel.deleteMany({ session: session._id }).exec();
    }

    // Then delete all sessions
    await this.sessionModel.deleteMany({ creator: userId }).exec();

    // Finally delete the user
    await user.deleteOne();
  }
}
