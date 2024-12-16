import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Participant } from './participant.schema';
import { PLAN_LIMITS } from '../users/user.schema';
import { SessionsService } from '../sessions/sessions.service';

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
    const participant = await this.participantModel
      .findOne({
        _id: new Types.ObjectId(participantId),
        session: new Types.ObjectId(sessionId),
      })
      .exec();

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant;
  }

  async create(participantData: {
    name: string;
    email: string;
    sessionId: string;
  }): Promise<Participant> {
    // Get the session to check the plan
    const session = await this.sessionsService.getSession(
      participantData.sessionId,
    );

    // Get current participant count
    const currentParticipants = await this.findAllBySession(
      participantData.sessionId,
    );
    const planLimit = PLAN_LIMITS[session.plan].maxParticipants;

    // Check if adding another participant would exceed the plan limit
    if (currentParticipants.length >= planLimit) {
      throw new BadRequestException(
        `Cannot add more participants. Your ${session.plan} plan is limited to ${planLimit} participants.`,
      );
    }

    // Create a new participant
    const participant = new this.participantModel({
      name: participantData.name,
      email: participantData.email,
      session: new Types.ObjectId(participantData.sessionId),
    });
    const savedParticipant = await participant.save();

    // Update the session's participants array
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
  ): Promise<void> {
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
  }

  async updateAssignment(
    participantId: string,
    assignedToName: string,
  ): Promise<void> {
    const participant = await this.participantModel
      .findById(new Types.ObjectId(participantId))
      .exec();
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    participant.assignedTo = assignedToName;
    await participant.save();
  }

  async updatePreferences(
    sessionId: string,
    participantId: string,
    preferences: Participant['preferences'],
  ): Promise<Participant> {
    const participant = await this.participantModel
      .findOne({
        _id: new Types.ObjectId(participantId),
        session: new Types.ObjectId(sessionId),
      })
      .exec();

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.preferences = {
      ...participant.preferences,
      ...preferences,
    };

    return participant.save();
  }
}
