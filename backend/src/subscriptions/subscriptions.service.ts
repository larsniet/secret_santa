import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../sessions/sessions.service';
import { PLAN_LIMITS, EventPlan } from '../users/user.schema';
import { SessionStatus } from '../sessions/session.schema';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createCheckoutSession(sessionId: string) {
    const session = await this.sessionsService.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const planDetails = PLAN_LIMITS[session.plan];
    const priceInCents = planDetails.price * 100;

    // Create or retrieve the Stripe product for this plan
    const product = await this.getOrCreateProduct(session.plan);

    const checkoutSession = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: product.id,
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/sessions/${sessionId}?payment=success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/sessions/${sessionId}?payment=cancelled`,
      metadata: {
        sessionId,
      },
    });

    return { id: checkoutSession.id };
  }

  private async getOrCreateProduct(plan: EventPlan): Promise<Stripe.Product> {
    const planDetails = PLAN_LIMITS[plan];

    // Search for existing product
    const existingProducts = await this.stripe.products.search({
      query: `metadata['planName']:'${plan}'`,
    });

    if (existingProducts.data.length > 0) {
      return existingProducts.data[0];
    }

    // Create new product if it doesn't exist
    return this.stripe.products.create({
      name: `${plan} Plan`,
      description: `Secret Santa ${plan} Plan - One-time payment`,
      metadata: {
        planName: plan,
        maxParticipants: planDetails.maxParticipants.toString(),
        features: planDetails.features.join(', '),
      },
      active: true,
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { sessionId } = session.metadata;

      // Update session status to active
      await this.sessionsService.updateStatus(sessionId, SessionStatus.ACTIVE);
    }

    return { received: true };
  }
}
