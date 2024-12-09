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
    return this.sessionsService.getSessionByInviteCode(inviteCode);
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
}
