import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
  RawBodyRequest,
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
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.subscriptionsService.handleWebhook(
      signature,
      request.rawBody as Buffer,
    );
  }
}
