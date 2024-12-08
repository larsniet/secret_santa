import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { Participant } from './participant.schema';

@Controller('sessions/:sessionId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  async findAll(@Param('sessionId') sessionId: string): Promise<Participant[]> {
    return this.participantsService.findAllBySession(sessionId);
  }

  @Post()
  async create(
    @Param('sessionId') sessionId: string,
    @Body() participantData: { name: string; email: string },
  ): Promise<Participant> {
    return this.participantsService.create({
      ...participantData,
      sessionId,
    });
  }

  @Delete()
  async deleteAll(
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    await this.participantsService.deleteAllFromSession(sessionId);
    return { message: 'All participants deleted successfully' };
  }

  @Delete(':participantId')
  async deleteParticipant(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
  ): Promise<{ message: string }> {
    await this.participantsService.deleteParticipant(sessionId, participantId);
    return { message: 'Participant deleted successfully' };
  }

  @Patch(':participantId/preferences')
  async updatePreferences(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
    @Body()
    preferences: {
      interests?: string;
      sizes?: string;
      wishlist?: string;
      restrictions?: string;
    },
  ): Promise<Participant> {
    return this.participantsService.updatePreferences(
      sessionId,
      participantId,
      preferences,
    );
  }

  @Get(':participantId')
  async getParticipant(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
  ): Promise<Participant> {
    return this.participantsService.findParticipant(sessionId, participantId);
  }
}
