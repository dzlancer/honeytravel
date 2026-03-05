import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { IsString, IsNumber, IsDateString, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from './entities/booking.entity';

class GuestDetailDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
}

class CreateBookingDto {
  @ApiProperty() @IsString() productType: ProductType;
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsString() supplierId: string;
  @ApiProperty() @IsDateString() checkIn: string;
  @ApiProperty() @IsDateString() checkOut: string;
  @ApiProperty() @IsNumber() @Min(1) guestCount: number;
  @ApiProperty() @IsNumber() totalAmount: number;
  @ApiProperty({ default: 'USD' }) @IsOptional() @IsString() currency?: string;
  @ApiProperty({ type: [GuestDetailDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => GuestDetailDto) guestDetails: GuestDetailDto[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() promoCode?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() loyaltyPointsToUse?: number;
}

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user bookings' })
  async myBookings(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.findByUserId(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.cancel(id, userId);
  }
}
