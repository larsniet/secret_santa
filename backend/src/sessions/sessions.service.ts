import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionStatus } from './session.schema';
import { ParticipantsService } from '../participants/participants.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @Inject(forwardRef(() => ParticipantsService))
    private participantsService: ParticipantsService,
  ) {}

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createSession(
    userId: string,
    createSessionDto: {
      name: string;
      budget: number;
      registrationDeadline: Date;
      giftExchangeDate: Date;
    },
  ): Promise<Session> {
    // Validate dates
    const now = new Date();

    if (new Date(createSessionDto.registrationDeadline) <= now) {
      throw new BadRequestException(
        'Registration deadline must be in the future',
      );
    }

    if (
      new Date(createSessionDto.giftExchangeDate) <=
      new Date(createSessionDto.registrationDeadline)
    ) {
      throw new BadRequestException(
        'Gift exchange date must be after registration deadline',
      );
    }

    // Validate budget
    if (createSessionDto.budget <= 0) {
      throw new BadRequestException('Budget must be greater than 0');
    }

    const inviteCode = this.generateInviteCode();
    const session = new this.sessionModel({
      ...createSessionDto,
      creator: new Types.ObjectId(userId),
      inviteCode,
      status: SessionStatus.OPEN,
    });
    const savedSession = await session.save();
    return savedSession.toObject();
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const sessions = await this.sessionModel
      .find({ creator: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
    return sessions.map((session) => session.toObject());
  }

  async getSession(id: string): Promise<Session> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session.toObject();
  }

  async getSessionByInviteCode(inviteCode: string): Promise<Session> {
    const session = await this.sessionModel.findOne({ inviteCode }).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session.toObject();
  }

  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Validate status transitions
    switch (session.status) {
      case SessionStatus.OPEN:
        if (status !== SessionStatus.LOCKED) {
          throw new BadRequestException('Open sessions can only be locked');
        }
        if (!session.participants?.length) {
          throw new BadRequestException(
            'Cannot lock a session with no participants',
          );
        }
        break;
      case SessionStatus.LOCKED:
        if (status !== SessionStatus.COMPLETED) {
          throw new BadRequestException(
            'Locked sessions can only be completed',
          );
        }
        break;
      case SessionStatus.COMPLETED:
        throw new BadRequestException('Completed sessions cannot be updated');
    }

    session.status = status;
    if (status === SessionStatus.COMPLETED) {
      session.completedAt = new Date();
    }
    return session.save();
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    return this.sessionModel
      .countDocuments({
        creator: new Types.ObjectId(userId),
        status: SessionStatus.OPEN,
      })
      .exec();
  }

  async removeParticipantFromSession(
    sessionId: string,
    participantId: string,
  ): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: new Types.ObjectId(sessionId) },
      { $pull: { participants: new Types.ObjectId(participantId) } },
    );
  }

  async addParticipantToSession(
    sessionId: string,
    participantId: string,
  ): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: new Types.ObjectId(sessionId) },
      { $addToSet: { participants: new Types.ObjectId(participantId) } },
    );
  }

  async deleteSession(id: string): Promise<void> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.participantsService.deleteAllFromSession(id);
    await session.deleteOne();
  }

  async updateSession(
    id: string,
    updateSessionDto: {
      budget?: number;
      registrationDeadline?: Date;
      giftExchangeDate?: Date;
      name?: string;
    },
  ) {
    const session = await this.sessionModel
      .findByIdAndUpdate(id, updateSessionDto, { new: true })
      .exec();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }
}
