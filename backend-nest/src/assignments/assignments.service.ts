import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ParticipantsService } from '../participants/participants.service';
import { EmailService } from '../email/email.service';
import { SessionsService } from '../sessions/sessions.service';
import { SessionStatus } from '../sessions/session.schema';
import { Participant } from '../participants/participant.schema';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly participantsService: ParticipantsService,
    private readonly emailService: EmailService,
    private readonly sessionsService: SessionsService,
  ) {}

  async createAndSendAssignments(sessionId: string, userId: string) {
    // Verify session and permissions
    const session =
      await this.sessionsService.getSessionByInviteCode(sessionId);
    if (session.creator.toString() !== userId) {
      throw new UnauthorizedException(
        'Only the creator can create assignments',
      );
    }
    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Can only create assignments for active sessions',
      );
    }

    const participants =
      await this.participantsService.findAllBySession(sessionId);
    if (participants.length < 2) {
      throw new NotFoundException(
        'Need at least 2 participants to create assignments',
      );
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const assignments = [];
    const emailPromises = [];

    for (let i = 0; i < shuffled.length; i++) {
      const nextIndex = (i + 1) % shuffled.length;
      const currentParticipant = shuffled[i] as Participant;
      const recipientName = shuffled[nextIndex].name;

      assignments.push({
        participant: currentParticipant,
        assignedTo: recipientName,
      });

      // Update participant's assignment
      await this.participantsService.updateAssignment(
        currentParticipant._id.toString(),
        recipientName,
      );

      // Send email
      emailPromises.push(
        this.emailService.sendAssignmentEmail(
          currentParticipant,
          recipientName,
        ),
      );
    }

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Update session status
    await this.sessionsService.updateSessionStatus(
      sessionId,
      userId,
      SessionStatus.COMPLETED,
    );

    return assignments;
  }

  async updateParticipantAssignments(
    participants: Participant[],
    assignments: { [key: string]: string },
  ): Promise<void> {
    for (const [participantId, recipientName] of Object.entries(assignments)) {
      const currentParticipant = participants.find(
        (p) => p._id.toString() === participantId,
      );
      if (!currentParticipant) continue;

      // Update participant's assignment
      await this.participantsService.updateAssignment(
        participantId,
        recipientName,
      );
    }
  }
}
