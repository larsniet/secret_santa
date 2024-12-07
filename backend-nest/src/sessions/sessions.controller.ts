import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { Session, SessionStatus } from './session.schema';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSession(
    @Request() req,
    @Body() createSessionDto: { name: string },
  ): Promise<Session> {
    return this.sessionsService.createSession(
      req.user.userId,
      createSessionDto.name,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  async getUserSessions(@Request() req): Promise<Session[]> {
    return this.sessionsService.getUserSessions(req.user.userId);
  }

  @Get('invite/:code')
  async getSessionByInviteCode(
    @Param('code') inviteCode: string,
  ): Promise<Session> {
    return this.sessionsService.getSessionByInviteCode(inviteCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSession(
    @Request() req,
    @Param('id') sessionId: string,
  ): Promise<Session> {
    return this.sessionsService.getSession(sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateSessionStatus(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() updateStatusDto: { status: SessionStatus },
  ): Promise<Session> {
    return this.sessionsService.updateSessionStatus(
      sessionId,
      req.user.userId,
      updateStatusDto.status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSession(
    @Request() req,
    @Param('id') sessionId: string,
  ): Promise<void> {
    return this.sessionsService.deleteSession(sessionId, req.user.userId);
  }
}
