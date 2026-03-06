import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  // ─── Hotels ────────────────────────────────────────────────

  @Public()
  @Get('hotels/search')
  @ApiOperation({ summary: 'Search hotels across all suppliers' })
  @ApiQuery({ name: 'destination', required: false })
  @ApiQuery({ name: 'checkIn', required: false })
  @ApiQuery({ name: 'checkOut', required: false })
  @ApiQuery({ name: 'guests', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'starRating', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchHotels(
    @Query('destination') destination?: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('guests') guests?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('starRating') starRating?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.searchHotels({
      destination: destination || '',
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: guests || 2,
      minPrice,
      maxPrice,
      starRating: starRating ? starRating.split(',').map(Number) : undefined,
      sortBy: sortBy as 'price' | 'rating' | 'distance',
      sortOrder: sortOrder as 'asc' | 'desc',
      page,
      limit,
    });
  }

  @Public()
  @Get('hotels/:id')
  @ApiOperation({ summary: 'Get hotel details' })
  async getHotel(@Param('id') id: string) {
    return this.suppliersService.getHotelById(id);
  }

  @Public()
  @Post('hotels/:id/availability')
  @ApiOperation({ summary: 'Check hotel availability' })
  async checkAvailability(
    @Param('id') id: string,
    @Body() body: { supplierId: string; checkIn: string; checkOut: string; occupancy: { adults: number; children: number } },
  ) {
    return this.suppliersService.checkAvailability(
      body.supplierId, id, body.checkIn, body.checkOut, body.occupancy,
    );
  }

  // ─── Flights ───────────────────────────────────────────────

  @Public()
  @Get('flights/search')
  @ApiOperation({ summary: 'Search flights across all suppliers' })
  @ApiQuery({ name: 'origin', required: false })
  @ApiQuery({ name: 'destination', required: false })
  @ApiQuery({ name: 'departureDate', required: false })
  @ApiQuery({ name: 'returnDate', required: false })
  @ApiQuery({ name: 'passengers', required: false })
  @ApiQuery({ name: 'cabinClass', required: false })
  @ApiQuery({ name: 'directOnly', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchFlights(
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
    @Query('departureDate') departureDate?: string,
    @Query('returnDate') returnDate?: string,
    @Query('passengers') passengers?: number,
    @Query('cabinClass') cabinClass?: string,
    @Query('directOnly') directOnly?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.searchFlights({
      origin: origin || '',
      destination: destination || '',
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      returnDate: returnDate || undefined,
      passengers: passengers || 1,
      cabinClass,
      directOnly: directOnly === 'true',
      sortBy: sortBy as 'price' | 'duration' | 'departure',
      sortOrder: sortOrder as 'asc' | 'desc',
      page,
      limit,
    });
  }

  @Public()
  @Get('flights/:id')
  @ApiOperation({ summary: 'Get flight details' })
  async getFlight(@Param('id') id: string) {
    return this.suppliersService.getFlightById(id);
  }

  // ─── Activities ────────────────────────────────────────────

  @Public()
  @Get('activities/search')
  @ApiOperation({ summary: 'Search activities and tours' })
  @ApiQuery({ name: 'destination', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'groupSize', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchActivities(
    @Query('destination') destination?: string,
    @Query('date') date?: string,
    @Query('category') category?: string,
    @Query('groupSize') groupSize?: number,
    @Query('difficulty') difficulty?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.searchActivities({
      destination: destination || '',
      date,
      category,
      groupSize,
      difficulty,
      minPrice,
      maxPrice,
      sortBy: sortBy as 'price' | 'rating' | 'duration',
      sortOrder: sortOrder as 'asc' | 'desc',
      page,
      limit,
    });
  }

  @Public()
  @Get('activities/:id')
  @ApiOperation({ summary: 'Get activity details' })
  async getActivity(@Param('id') id: string) {
    return this.suppliersService.getActivityById(id);
  }

  // ─── Car Rentals ───────────────────────────────────────────

  @Public()
  @Get('cars/search')
  @ApiOperation({ summary: 'Search car rentals' })
  @ApiQuery({ name: 'pickupLocation', required: false })
  @ApiQuery({ name: 'dropoffLocation', required: false })
  @ApiQuery({ name: 'pickupDate', required: false })
  @ApiQuery({ name: 'dropoffDate', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'transmission', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchCars(
    @Query('pickupLocation') pickupLocation?: string,
    @Query('dropoffLocation') dropoffLocation?: string,
    @Query('pickupDate') pickupDate?: string,
    @Query('dropoffDate') dropoffDate?: string,
    @Query('category') category?: string,
    @Query('transmission') transmission?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.searchCars({
      pickupLocation: pickupLocation || '',
      dropoffLocation,
      pickupDate: pickupDate || new Date().toISOString().split('T')[0],
      dropoffDate: dropoffDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      category,
      transmission,
      minPrice,
      maxPrice,
      sortBy: sortBy as 'price' | 'rating',
      sortOrder: sortOrder as 'asc' | 'desc',
      page,
      limit,
    });
  }

  @Public()
  @Get('cars/:id')
  @ApiOperation({ summary: 'Get car rental details' })
  async getCar(@Param('id') id: string) {
    return this.suppliersService.getCarById(id);
  }
}
