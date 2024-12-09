import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sessions/:sessionId/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAssignments(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    const assignments = await this.assignmentsService.createAndSendAssignments(
      sessionId,
      req.user.userId,
    );
    return {
      message: 'Assignments created and emails sent successfully',
      assignments,
    };
  }
}
