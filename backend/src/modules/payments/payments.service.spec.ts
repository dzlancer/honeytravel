import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/entities/booking.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: jest.Mocked<Partial<Repository<Payment>>>;
  let bookingsService: jest.Mocked<Partial<BookingsService>>;

  const mockPayment: Partial<Payment> = {
    id: 'payment-1',
    bookingId: 'booking-1',
    userId: 'user-1',
    amount: 500,
    currency: 'USD',
    status: PaymentStatus.PENDING,
    method: PaymentMethod.CARD,
    stripePaymentIntentId: 'pi_mock_123',
  };

  const mockBooking = {
    id: 'booking-1',
    userId: 'user-1',
    totalAmount: 500,
    currency: 'USD',
    status: BookingStatus.PENDING,
  };

  beforeEach(async () => {
    paymentRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((p) => Promise.resolve({ id: 'payment-1', ...p })),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    bookingsService = {
      findById: jest.fn().mockResolvedValue(mockBooking),
      confirm: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.CONFIRMED }),
      updateStatus: jest.fn().mockResolvedValue(mockBooking),
    };
    const configService = {
      get: jest.fn().mockImplementation((key: string, defaultVal?: string) => {
        const map: Record<string, string> = {
          STRIPE_SECRET_KEY: 'sk_test_placeholder',
          STRIPE_WEBHOOK_SECRET: 'whsec_test',
        };
        return map[key] || defaultVal || '';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: BookingsService, useValue: bookingsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment in mock mode with placeholder key', async () => {
      const result = await service.createPaymentIntent('user-1', 'booking-1', 500, 'USD');

      expect(result).toHaveProperty('clientSecret');
      expect(result).toHaveProperty('paymentIntentId');
      expect(result).toHaveProperty('paymentId');
      expect(result.paymentIntentId).toMatch(/^pi_mock_/);
      expect(result.clientSecret).toContain('_secret_mock');
    });

    it('should save payment with PENDING status initially', async () => {
      await service.createPaymentIntent('user-1', 'booking-1', 500, 'USD');

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 'booking-1',
          userId: 'user-1',
          amount: 500,
          currency: 'USD',
          status: PaymentStatus.PENDING,
          method: PaymentMethod.CARD,
        }),
      );
    });

    it('should auto-confirm booking in mock mode', async () => {
      await service.createPaymentIntent('user-1', 'booking-1', 500, 'USD');

      expect(bookingsService.confirm).toHaveBeenCalledWith('booking-1');
    });

    it('should set payment status to SUCCEEDED in mock mode', async () => {
      await service.createPaymentIntent('user-1', 'booking-1', 500, 'USD');

      // save is called twice: once for initial creation, once for status update
      expect(paymentRepo.save).toHaveBeenCalledTimes(2);
      const secondSaveCall = paymentRepo.save!.mock.calls[1][0];
      expect(secondSaveCall).toHaveProperty('status', PaymentStatus.SUCCEEDED);
    });

    it('should throw BadRequestException when booking belongs to another user', async () => {
      bookingsService.findById!.mockResolvedValue({ ...mockBooking, userId: 'other-user' } as any);

      await expect(
        service.createPaymentIntent('user-1', 'booking-1', 500, 'USD'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not fail when mock confirm throws (non-blocking)', async () => {
      bookingsService.confirm!.mockRejectedValue(new Error('confirm error'));

      // Should not throw even though confirm fails
      const result = await service.createPaymentIntent('user-1', 'booking-1', 500, 'USD');

      expect(result).toHaveProperty('paymentIntentId');
    });

    it('should verify booking exists before creating payment', async () => {
      bookingsService.findById!.mockRejectedValue(new BadRequestException('Not found'));

      await expect(
        service.createPaymentIntent('user-1', 'booking-1', 500, 'USD'),
      ).rejects.toThrow();

      expect(paymentRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentSuccess (private, tested via casting)', () => {
    it('should update payment status to SUCCEEDED and confirm booking', async () => {
      paymentRepo.findOne!.mockResolvedValue(mockPayment as Payment);

      await (service as any).handlePaymentSuccess({ id: 'pi_mock_123' });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.SUCCEEDED }),
      );
      expect(bookingsService.confirm).toHaveBeenCalledWith('booking-1');
    });

    it('should do nothing when payment not found', async () => {
      paymentRepo.findOne!.mockResolvedValue(null);

      await (service as any).handlePaymentSuccess({ id: 'pi_unknown' });

      expect(paymentRepo.save).not.toHaveBeenCalled();
      expect(bookingsService.confirm).not.toHaveBeenCalled();
    });

    it('should look up payment by stripePaymentIntentId', async () => {
      paymentRepo.findOne!.mockResolvedValue(mockPayment as Payment);

      await (service as any).handlePaymentSuccess({ id: 'pi_test_xyz' });

      expect(paymentRepo.findOne).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test_xyz' },
      });
    });
  });

  describe('handlePaymentFailure (private, tested via casting)', () => {
    it('should update status to FAILED and record failure reason', async () => {
      paymentRepo.findOne!.mockResolvedValue(mockPayment as Payment);

      await (service as any).handlePaymentFailure({
        id: 'pi_mock_123',
        last_payment_error: { message: 'Card declined' },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.FAILED,
          failureReason: 'Card declined',
        }),
      );
      expect(bookingsService.updateStatus).toHaveBeenCalledWith(
        'booking-1',
        BookingStatus.FAILED,
      );
    });

    it('should use "Unknown error" when no error message provided', async () => {
      paymentRepo.findOne!.mockResolvedValue(mockPayment as Payment);

      await (service as any).handlePaymentFailure({
        id: 'pi_mock_123',
        last_payment_error: null,
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ failureReason: 'Unknown error' }),
      );
    });

    it('should do nothing when payment not found', async () => {
      paymentRepo.findOne!.mockResolvedValue(null);

      await (service as any).handlePaymentFailure({
        id: 'pi_nonexistent',
        last_payment_error: null,
      });

      expect(paymentRepo.save).not.toHaveBeenCalled();
      expect(bookingsService.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('refund', () => {
    it('should throw BadRequestException when payment not found', async () => {
      paymentRepo.findOne!.mockResolvedValue(null);

      await expect(service.refund('nonexistent')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when payment status is not SUCCEEDED', async () => {
      paymentRepo.findOne!.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PENDING,
      } as Payment);

      await expect(service.refund('payment-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when payment is already FAILED', async () => {
      paymentRepo.findOne!.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      } as Payment);

      await expect(service.refund('payment-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when Stripe refund fails', async () => {
      paymentRepo.findOne!.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
      } as Payment);
      // Mock the internal Stripe client to simulate refund failure
      (service as any).stripe = {
        refunds: {
          create: jest.fn().mockRejectedValue(new Error('Stripe network error')),
        },
      };

      await expect(service.refund('payment-1')).rejects.toThrow(BadRequestException);
    });

    it('should refund successfully and update statuses', async () => {
      paymentRepo.findOne!.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: 'pi_real_123',
      } as Payment);
      // Mock successful Stripe refund
      (service as any).stripe = {
        refunds: {
          create: jest.fn().mockResolvedValue({ id: 're_123' }),
        },
      };

      await service.refund('payment-1');

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.REFUNDED }),
      );
      expect(bookingsService.updateStatus).toHaveBeenCalledWith(
        'booking-1',
        BookingStatus.REFUNDED,
      );
    });
  });
});
