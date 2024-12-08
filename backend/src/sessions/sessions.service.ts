import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument, SessionStatus } from './session.schema';
import { ParticipantsService } from '../participants/participants.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private participantsService: ParticipantsService,
  ) {}

  async createSession(userId: string, name: string): Promise<Session> {
    const session = new this.sessionModel({
      name,
      creator: userId,
      status: 'active',
      inviteCode: Math.random().toString(36).substring(2, 15),
      participants: [],
    });
    return session.save();
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionModel
      .find({ creator: userId })
      .populate('creator')
      .populate('participants')
      .exec();
  }

  async getSession(sessionId: string): Promise<Session> {
    const session = await this.sessionModel
      .findById(sessionId)
      .populate('creator')
      .populate('participants')
      .exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async getSessionByInviteCode(inviteCode: string): Promise<Session> {
    const session = await this.sessionModel
      .findOne({ inviteCode })
      .populate('creator')
      .populate('participants')
      .exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async updateSessionStatus(
    sessionId: string,
    userId: string,
    status: SessionStatus,
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.creator.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to update this session');
    }

    session.status = status;
    if (status === 'completed') {
      session.completedAt = new Date();
    }
    return session.save();
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.creator.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to delete this session');
    }

    // First delete all participants associated with this session
    await this.participantsService.deleteAllFromSession(sessionId);

    // Then delete the session
    await session.deleteOne();
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    return this.sessionModel
      .countDocuments({
        creator: userId,
        status: SessionStatus.ACTIVE,
      })
      .exec();
  }

  async updateSessionParticipants(
    sessionId: string,
    participantIds: Types.ObjectId[],
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    session.participants = participantIds;
    return session.save();
  }
}
