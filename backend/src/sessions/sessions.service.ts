import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionStatus } from './session.schema';
import { EventPlan } from '../users/user.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async createSession(
    userId: string,
    data: { name: string; plan: EventPlan },
  ): Promise<Session> {
    const session = new this.sessionModel({
      name: data.name,
      creator: userId,
      plan: data.plan,
      status:
        data.plan === EventPlan.FREE
          ? SessionStatus.ACTIVE
          : SessionStatus.PENDING_PAYMENT,
      inviteCode: Math.random().toString(36).substring(2, 15),
    });
    return session.save();
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionModel
      .find({ creator: userId })
      .populate('participants')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getSession(id: string): Promise<Session> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async getSessionByInviteCode(inviteCode: string): Promise<Session> {
    const session = await this.sessionModel.findOne({ inviteCode }).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    session.status = status;
    if (status === SessionStatus.COMPLETED) {
      session.completedAt = new Date();
    }
    return session.save();
  }

  async updateSessionStatus(
    sessionId: string,
    userId: string,
    status: SessionStatus,
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (session.creator.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to update this session');
    }
    return this.updateStatus(sessionId, status);
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session.creator.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to delete this session');
    }
    await this.sessionModel.deleteOne({ _id: sessionId });
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    return this.sessionModel
      .countDocuments({
        creator: userId,
        status: SessionStatus.ACTIVE,
      })
      .exec();
  }
}
