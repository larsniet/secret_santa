import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParticipantsService } from './participants.service';
import { Participant } from './participant.schema';

@Controller('sessions/:sessionId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteAll(
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    await this.participantsService.deleteAllFromSession(sessionId);
    return { message: 'All participants deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
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
    @Body() preferences: Participant['preferences'],
  ): Promise<Participant> {
    return this.participantsService.updatePreferences(
      sessionId,
      participantId,
      preferences,
    );
  }

  @Post(':participantId/products')
  async getMatchingProducts(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
    @Body() body: { page: number },
  ): Promise<any[]> {
    const { page } = body;
    return this.participantsService.getMatchingProducts(
      sessionId,
      participantId,
      page,
    );
  }

  @Get(':participantId')
  async getParticipant(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
  ): Promise<Participant> {
    const participant = await this.participantsService.findParticipant(
      sessionId,
      participantId,
    );

    return participant;
  }
}
