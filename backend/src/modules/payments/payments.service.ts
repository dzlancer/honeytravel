import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private bookingsService: BookingsService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY', 'sk_test_placeholder'),
      { apiVersion: '2023-10-16' as Stripe.LatestApiVersion },
    );
  }

  async createPaymentIntent(
    userId: string,
    bookingId: string,
    amount: number,
    currency: string,
  ) {
    const booking = await this.bookingsService.findById(bookingId);
    if (booking.userId !== userId) {
      throw new BadRequestException('Not your booking');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: currency.toLowerCase(),
        metadata: { bookingId, userId },
      });

      const payment = this.paymentRepo.create({
        bookingId,
        userId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.CARD,
        stripePaymentIntentId: paymentIntent.id,
      });
      await this.paymentRepo.save(payment);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error}`);
      throw new BadRequestException('Payment initialization failed');
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET', '');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(intent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(intent);
        break;
      }
    }
  }

  private async handlePaymentSuccess(intent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: intent.id },
    });
    if (!payment) return;

    payment.status = PaymentStatus.SUCCEEDED;
    await this.paymentRepo.save(payment);

    // Confirm the booking
    await this.bookingsService.confirm(payment.bookingId);
  }

  private async handlePaymentFailure(intent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: intent.id },
    });
    if (!payment) return;

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = intent.last_payment_error?.message || 'Unknown error';
    await this.paymentRepo.save(payment);

    await this.bookingsService.updateStatus(payment.bookingId, BookingStatus.FAILED);
  }

  async refund(paymentId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    try {
      await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId!,
      });
      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepo.save(payment);
      await this.bookingsService.updateStatus(payment.bookingId, BookingStatus.REFUNDED);
    } catch (error) {
      this.logger.error(`Refund failed: ${error}`);
      throw new BadRequestException('Refund failed');
    }
  }
}
