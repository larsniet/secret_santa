import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Participant } from './participant.schema';
import { SessionsService } from '../sessions/sessions.service';
import { SessionStatus } from '../sessions/session.schema';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private participantModel: Model<Participant>,
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
  ) {}

  async findAllBySession(sessionId: string): Promise<Participant[]> {
    return this.participantModel
      .find({ session: new Types.ObjectId(sessionId) })
      .exec();
  }

  async findParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<Participant> {
    const session = await this.sessionsService.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Allow access if session is open or locked
    if (
      session.status !== SessionStatus.OPEN &&
      session.status !== SessionStatus.LOCKED
    ) {
      throw new ForbiddenException(
        'Cannot access participant details at this time',
      );
    }

    const participant = await this.participantModel
      .findOne({
        _id: new Types.ObjectId(participantId),
        session: new Types.ObjectId(sessionId),
      })
      .populate('assignedTo')
      .exec();

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant.toObject();
  }

  async create(participantData: {
    name: string;
    email: string;
    sessionId: string;
  }): Promise<Participant> {
    const currentParticipants = await this.findAllBySession(
      participantData.sessionId,
    );

    if (currentParticipants.length >= 25) {
      throw new BadRequestException(
        'Maximum limit of 25 participants reached for this session',
      );
    }

    const session = await this.sessionsService.getSession(
      participantData.sessionId,
    );
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const participant = new this.participantModel({
      ...participantData,
      session: new Types.ObjectId(participantData.sessionId),
      preferences: {
        interests: '',
        sizes: {
          clothing: '',
          shoe: '',
          ring: '',
        },
        wishlist: '',
        restrictions: '',
        ageGroup: '',
        gender: '',
      },
    });

    const savedParticipant = await participant.save();

    // Update session's participants array
    await this.sessionsService.addParticipantToSession(
      participantData.sessionId,
      savedParticipant._id.toString(),
    );

    return savedParticipant;
  }

  async deleteAllFromSession(sessionId: string): Promise<void> {
    await this.participantModel
      .deleteMany({ session: new Types.ObjectId(sessionId) })
      .exec();
  }

  async deleteParticipant(
    sessionId: string,
    participantId: string,
    userId?: string,
  ): Promise<void> {
    // First get the session to check ownership
    const session = await this.sessionsService.getSession(sessionId);

    // Check if userId is provided and if the user is the session owner
    if (userId && session.creator.toString() !== userId) {
      throw new UnauthorizedException(
        'Not authorized to remove participants from this session',
      );
    }

    const participant = await this.participantModel
      .findOne({
        _id: new Types.ObjectId(participantId),
        session: new Types.ObjectId(sessionId),
      })
      .exec();

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    await participant.deleteOne();

    await this.sessionsService.removeParticipantFromSession(
      sessionId,
      participantId,
    );
  }

  async getMatchingProducts(
    sessionId: string,
    participantId: string,
    page: number = 1,
  ): Promise<any[]> {
    // Get the participant
    const participant = await this.participantModel
      .findOne({
        _id: new Types.ObjectId(participantId),
        session: new Types.ObjectId(sessionId),
      })
      .exec();

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Get the preferences
    const preferences = participant.preferences;
    if (!preferences) {
      throw new BadRequestException('Participant has no preferences set');
    }

    // Clean up sizes object by removing undefined values and ensuring string values
    const sizes = Object.entries(preferences.sizes || {}).reduce(
      (acc, [key, value]) => {
        acc[key] = value?.toString() || '';
        return acc;
      },
      {
        clothing: '',
        shoe: '',
        ring: '',
      } as Record<string, string>,
    );

    const requestBody = {
      interests: preferences.interests || '',
      sizes,
      wishlist: preferences.wishlist || '',
      restrictions: preferences.restrictions || '',
      ageGroup: preferences.ageGroup || '30-49',
      gender: preferences.gender || 'Prefer not to say',
    };

    try {
      // Call the matching module API
      const response = await fetch(
        `${process.env.MATCHING_MODULE_URL}/match-products?page=${page}&pageSize=6`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`Matching module error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting product recommendations:', error);
      throw new Error('Failed to get product recommendations');
    }
  }

  async updateAssignment(
    participantId: string,
    assignedToId: string,
  ): Promise<void> {
    const participant = await this.participantModel
      .findById(new Types.ObjectId(participantId))
      .exec();
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    participant.assignedTo = new Types.ObjectId(assignedToId);
    await participant.save();
  }

  async updatePreferences(
    sessionId: string,
    participantId: string,
    preferences: Participant['preferences'],
  ): Promise<Participant> {
    const session = await this.sessionsService.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Allow updates if session is open or locked
    if (
      session.status !== SessionStatus.OPEN &&
      session.status !== SessionStatus.LOCKED
    ) {
      throw new ForbiddenException('Cannot update preferences at this time');
    }

    const participant = await this.participantModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(participantId),
          session: new Types.ObjectId(sessionId),
        },
        { preferences },
        { new: true },
      )
      .exec();

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant.toObject();
  }
}
