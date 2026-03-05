import { Controller, Post, Body, Req, UseGuards, Headers, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';
import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreatePaymentDto {
  @ApiProperty() @IsString() bookingId: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiProperty({ default: 'USD' }) @IsString() currency: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe payment intent' })
  async createIntent(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPaymentIntent(
      userId, dto.bookingId, dto.amount, dto.currency,
    );
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.paymentsService.handleWebhook(signature, req.rawBody!);
    return { received: true };
  }
}
