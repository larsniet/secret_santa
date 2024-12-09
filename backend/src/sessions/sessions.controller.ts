import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { EventPlan } from '../users/user.schema';
import { SessionStatus } from './session.schema';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionsService.getSession(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateSession(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: { name: string },
  ) {
    return this.sessionsService.updateSession(id, req.user.userId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSession(@Param('id') id: string, @Request() req) {
    await this.sessionsService.deleteSession(id, req.user.userId);
    return { message: 'Session deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateSessionStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() data: { status: SessionStatus },
  ) {
    return this.sessionsService.updateSessionStatus(
      id,
      req.user.userId,
      data.status,
    );
  }
}
