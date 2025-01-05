import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { SessionStatus } from './session.schema';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSession(
    @Request() req,
    @Body()
    createSessionDto: {
      name: string;
      budget: number;
      registrationDeadline: Date;
      giftExchangeDate: Date;
    },
  ) {
    const session = await this.sessionsService.createSession(
      req.user.userId,
      createSessionDto,
    );
    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getUserSessions(@Request() req) {
    const sessions = await this.sessionsService.getUserSessions(
      req.user.userId,
    );
    return sessions;
  }

  @Get('invite/:inviteCode')
  async getSessionByInviteCode(@Param('inviteCode') inviteCode: string) {
    const session =
      await this.sessionsService.getSessionByInviteCode(inviteCode);
    if (session.status !== SessionStatus.OPEN) {
      throw new ForbiddenException(
        'Cannot join session - no longer accepting participants',
      );
    }
    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSession(@Request() req, @Param('id') id: string) {
    const session = await this.sessionsService.getSession(id);
    if (session.creator.toString() !== req.user.userId) {
      throw new ForbiddenException('You do not have access to this session');
    }
    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateSessionStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: SessionStatus,
  ) {
    const session = await this.sessionsService.getSession(id);
    if (session.creator.toString() !== req.user.userId) {
      throw new ForbiddenException('You do not have access to this session');
    }
    return this.sessionsService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSession(@Request() req, @Param('id') id: string) {
    console.log('Delete request received for session:', id);
    console.log('User ID:', req.user.userId);
    const session = await this.sessionsService.getSession(id);
    console.log('Session found:', session);
    if (session.creator.toString() !== req.user.userId) {
      throw new ForbiddenException('You do not have access to this session');
    }
    await this.sessionsService.deleteSession(id);
    return { message: 'Session deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateSession(
    @Request() req,
    @Param('id') id: string,
    @Body()
    updateSessionDto: {
      budget?: number;
      registrationDeadline?: Date;
      giftExchangeDate?: Date;
      name?: string;
    },
  ) {
    const session = await this.sessionsService.getSession(id);
    if (session.creator.toString() !== req.user.userId) {
      throw new ForbiddenException('You can only update your own sessions');
    }
    return this.sessionsService.updateSession(id, updateSessionDto);
  }
}
