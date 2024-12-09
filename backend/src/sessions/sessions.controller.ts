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
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { SessionStatus } from './session.schema';
import { EventPlan } from '../users/user.schema';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async createSession(
    @Request() req,
    @Body() createSessionDto: { name: string; plan: EventPlan },
  ) {
    return this.sessionsService.createSession(
      req.user.userId,
      createSessionDto,
    );
  }

  @Get('my')
  async getUserSessions(@Request() req) {
    return this.sessionsService.getUserSessions(req.user.userId);
  }

  @Get('invite/:inviteCode')
  async getSessionByInviteCode(@Param('inviteCode') inviteCode: string) {
    const session =
      await this.sessionsService.getSessionByInviteCode(inviteCode);
    if (session.status === SessionStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Cannot join session - payment pending');
    }
    if (session.status === SessionStatus.COMPLETED) {
      throw new ForbiddenException('Cannot join session - already completed');
    }
    if (session.status === SessionStatus.ARCHIVED) {
      throw new ForbiddenException('Cannot join session - archived');
    }
    return session;
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionsService.getSession(id);
  }

  @Patch(':id/status')
  async updateSessionStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: { status: SessionStatus },
  ) {
    return this.sessionsService.updateSessionStatus(
      id,
      req.user.userId,
      updateStatusDto.status,
    );
  }

  @Delete(':id')
  async deleteSession(@Request() req, @Param('id') id: string) {
    return this.sessionsService.deleteSession(id, req.user.userId);
  }

  @Patch(':id')
  async updateSession(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSessionDto: { name: string },
  ) {
    return this.sessionsService.updateSession(
      id,
      req.user.userId,
      updateSessionDto,
    );
  }
}
