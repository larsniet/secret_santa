import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckoutSession(@Body() body: { sessionId: string }) {
    return this.subscriptionsService.createCheckoutSession(body.sessionId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: any,
  ) {
    // Access the raw body directly from the request
    const payload = request.body;
    if (!payload) {
      throw new Error('No webhook payload was provided');
    }
    return this.subscriptionsService.handleWebhook(signature, payload);
  }
}
