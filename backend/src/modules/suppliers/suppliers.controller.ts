import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

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
}
