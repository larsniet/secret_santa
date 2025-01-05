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
    const session = await this.sessionsService.getSession(sessionId);
    if (session.creator.toString() !== userId) {
      throw new UnauthorizedException(
        'Only the creator can create assignments',
      );
    }
    if (session.status !== SessionStatus.OPEN) {
      throw new UnauthorizedException(
        'Can only create assignments for open sessions',
      );
    }

    const participants =
      await this.participantsService.findAllBySession(sessionId);
    if (participants.length < 2) {
      throw new NotFoundException(
        'Need at least 2 participants to create assignments',
      );
    }

    function shuffleArray<T>(array: T[]): T[] {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    const shuffled = shuffleArray([...participants]);
    const assignments = [];
    const emailPromises = [];

    for (let i = 0; i < shuffled.length; i++) {
      const nextIndex = (i + 1) % shuffled.length;
      const currentParticipant = shuffled[i] as Participant;
      const assignedToParticipant = shuffled[nextIndex];

      assignments.push({
        participant: currentParticipant._id.toString(),
        assignedTo: assignedToParticipant._id.toString(),
      });

      // Update participant's assignment to reference the assignedTo ID
      await this.participantsService.updateAssignment(
        currentParticipant._id.toString(),
        assignedToParticipant._id.toString(),
      );

      // Send email
      emailPromises.push(
        this.emailService.sendAssignmentEmail(
          currentParticipant,
          assignedToParticipant.name, // Use assigned participant's name for email
        ),
      );
    }

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Update session status to locked
    await this.sessionsService.updateStatus(sessionId, SessionStatus.LOCKED);

    return assignments;
  }

  async updateParticipantAssignments(
    participants: Participant[],
    assignments: { [key: string]: string },
  ): Promise<void> {
    for (const [participantId, assignedToId] of Object.entries(assignments)) {
      const currentParticipant = participants.find(
        (p) => p._id.toString() === participantId,
      );
      if (!currentParticipant) continue;

      // Update participant's assignment with the assignedTo ID
      await this.participantsService.updateAssignment(
        participantId,
        assignedToId,
      );
    }
  }
}
