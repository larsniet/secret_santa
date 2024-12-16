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
      .populate('assignedTo')
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

    // Get the preferences or fallback to undefined
    const preferences = participant?.preferences;

    // Mock product data
    const products = [
      {
        id: '1',
        name: 'Book: Cooking Made Easy',
        category: 'Cooking',
        price: 15.99,
        imageUrl: 'https://via.placeholder.com/150',
      },
      {
        id: '2',
        name: 'Basketball',
        category: 'Sports',
        price: 20.0,
        imageUrl: 'https://via.placeholder.com/150',
      },
      {
        id: '3',
        name: 'Stylish T-Shirt',
        category: 'Clothing',
        price: 12.99,
        imageUrl: 'https://via.placeholder.com/150',
      },
      {
        id: '4',
        name: 'Running Shoes',
        category: 'Clothing',
        price: 45.0,
        imageUrl: 'https://via.placeholder.com/150',
      },
      {
        id: '5',
        name: 'Knitting Kit',
        category: 'Hobbies',
        price: 25.0,
        imageUrl: 'https://via.placeholder.com/150',
      },
      {
        id: '6',
        name: 'Box of Chocolates',
        category: 'Food',
        price: 10.0,
        imageUrl: 'https://via.placeholder.com/150',
      },
    ];

    // Filter products based on preferences if they exist
    const matchingProducts = preferences
      ? products.filter((product) => {
          if (
            preferences.interests &&
            product.category
              .toLowerCase()
              .includes(preferences.interests.toLowerCase())
          ) {
            return true;
          }
          if (
            preferences.sizes?.clothing &&
            product.name.toLowerCase().includes('shirt')
          ) {
            return true;
          }
          if (
            preferences.sizes?.shoe &&
            product.name.toLowerCase().includes('shoes')
          ) {
            return true;
          }
          if (
            preferences.hobbies &&
            product.category
              .toLowerCase()
              .includes(preferences.hobbies.toLowerCase())
          ) {
            return true;
          }
          return false;
        })
      : products; // If no preferences, return the entire product list

    // If no matching products and preferences exist, fallback to all products
    const finalProducts =
      matchingProducts.length > 0 ? matchingProducts : products;

    // Implement pagination
    const pageSize = 3;
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = finalProducts.slice(
      startIndex,
      startIndex + pageSize,
    );

    return paginatedProducts;
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
