import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from './participant.schema';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private participantModel: Model<Participant>,
  ) {}

  async findAllBySession(sessionId: string): Promise<Participant[]> {
    return this.participantModel.find({ session: sessionId }).exec();
  }

  async findParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<Participant> {
    const participant = await this.participantModel
      .findOne({
        _id: participantId,
        session: sessionId,
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
    const participant = new this.participantModel({
      name: participantData.name,
      email: participantData.email,
      session: participantData.sessionId,
    });
    return participant.save();
  }

  async deleteAllFromSession(sessionId: string): Promise<void> {
    await this.participantModel.deleteMany({ session: sessionId }).exec();
  }

  async deleteParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<void> {
    const participant = await this.participantModel
      .findOne({
        _id: participantId,
        session: sessionId,
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
    const participant = await this.participantModel.findById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    participant.assignedTo = assignedToName;
    await participant.save();
  }

  async updatePreferences(
    sessionId: string,
    participantId: string,
    preferences: {
      interests?: string;
      sizes?: string;
      wishlist?: string;
      restrictions?: string;
    },
  ): Promise<Participant> {
    const participant = await this.participantModel
      .findOne({
        _id: participantId,
        session: sessionId,
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
