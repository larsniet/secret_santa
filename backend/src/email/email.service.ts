import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';

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
    participant: { name: string; email: string },
    recipientName: string,
  ): Promise<void> {
    try {
      const template = await this.getEmailTemplate('email_template');
      const html = template
        .replace(/{{ss_name}}/g, participant.name)
        .replace(/{{ss_target}}/g, recipientName);

      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: participant.email,
        subject: 'Your Secret Santa Assignment! 🎄',
        html: html,
      });

      console.log(`Email sent to ${participant.email}`);
    } catch (error) {
      console.error(`Error sending email to ${participant.email}:`, error);
      throw error;
    }
  }
}
