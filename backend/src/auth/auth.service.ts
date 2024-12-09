import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/user.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pass, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationExpires,
      isEmailVerified: false,
    });

    await user.save();

    // Send verification email
    await this.emailService.sendVerificationEmail(
      name,
      email,
      verificationToken,
    );

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pass, ...result } = user.toObject();
    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        id: result._id,
        email: result.email,
        name: result.name,
        isEmailVerified: false,
      },
    };
  }

  async verifyEmail(token: string) {
    console.log('Verifying token:', token); // Add logging
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() },
      isEmailVerified: false,
    });

    console.log('Found user:', user); // Add logging

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    const payload = { email: user.email, sub: user._id };
    return {
      message: 'Email verified successfully',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: true,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({
      email,
      isEmailVerified: false,
    });

    if (!user) {
      throw new UnauthorizedException('User not found or already verified');
    }

    const verificationToken = this.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpires = verificationExpires;
    await user.save();

    await this.emailService.sendVerificationEmail(
      user.name,
      user.email,
      verificationToken,
    );

    return {
      message: 'Verification email has been resent',
    };
  }
}
