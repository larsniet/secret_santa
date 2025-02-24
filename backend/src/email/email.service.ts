import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Participant } from '../participants/participant.schema';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private async getEmailTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'email',
      'templates',
      `${templateName}.html`,
    );
    return await fs.readFile(templatePath, 'utf8');
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(
    name: string,
    email: string,
    token: string,
  ): Promise<void> {
    const verificationLink = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/verify?token=${token}`;

    const template = await this.getEmailTemplate('verify_email_template');

    const html = template
      .replace(/{{name}}/g, name)
      .replace(/{{verificationLink}}/g, verificationLink);

    await this.sendEmail({
      to: email,
      subject: 'Verify your email address',
      html,
    });
  }

  async sendAssignmentEmail(
    participant: Participant,
    recipientName: string,
  ): Promise<void> {
    try {
      const template = await this.getEmailTemplate('secret_santa_invite');

      let preferencesBlock = '';

      if (
        participant.preferences &&
        Object.values(participant.preferences).some(Boolean)
      ) {
        const preferences = `
          ${
            participant.preferences.interests
              ? `<li><strong>Interests:</strong> ${participant.preferences.interests}</li>`
              : ''
          }
          ${
            participant.preferences.sizes?.clothing
              ? `<li><strong>Clothing Size:</strong> ${participant.preferences.sizes.clothing}</li>`
              : ''
          }
          ${
            participant.preferences.sizes?.shoe
              ? `<li><strong>Shoe Size:</strong> ${participant.preferences.sizes.shoe}</li>`
              : ''
          }
          ${
            participant.preferences.sizes?.ring
              ? `<li><strong>Ring Size:</strong> ${participant.preferences.sizes.ring}</li>`
              : ''
          }
          ${
            participant.preferences.wishlist
              ? `<li><strong>Wishlist:</strong> ${participant.preferences.wishlist}</li>`
              : ''
          }
          ${
            participant.preferences.restrictions
              ? `<li><strong>Restrictions:</strong> ${participant.preferences.restrictions}</li>`
              : ''
          }
          ${
            participant.preferences.ageGroup
              ? `<li><strong>Age Group:</strong> ${participant.preferences.ageGroup}</li>`
              : ''
          }
          ${
            participant.preferences.gender
              ? `<li><strong>Gender:</strong> ${participant.preferences.gender}</li>`
              : ''
          }
        `;
        preferencesBlock = `
          <div
            style="
              background-color: #f9f9f9;
              padding: 15px;
              border-left: 4px solid #b91c1c;
              margin: 30px 20px;
              border-radius: 4px;
            "
          >
            <p style="margin: 0; font-weight: bold; color: #b91c1c">
              These are the preferences of your assigned giftee:
            </p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #333">
              ${preferences}
            </ul>
          </div>
        `;
      }

      const updatePreferencesLink = `${this.configService.get<string>(
        'FRONTEND_URL',
      )}/sessions/${participant.session}/participants/${participant._id.toString()}/preferences`;

      const html = template
        .replace(/{{ss_name}}/g, participant.name)
        .replace(/{{ss_target}}/g, recipientName)
        .replace(/{{ss_preferences_block}}/g, preferencesBlock)
        .replace(/{{update_preferences_link}}/g, updatePreferencesLink);

      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: participant.email,
        subject: 'Your Secret Santa Assignment! 🎄',
        html,
      });
    } catch (error) {
      console.error(`Error sending email to ${participant.email}:`, error);
      throw error;
    }
  }
}
