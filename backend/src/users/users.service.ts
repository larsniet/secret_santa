import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
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
    data: { name?: string; email?: string },
  ): Promise<User> {
    const user = await this.findById(userId);
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    return user.save();
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
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
