import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Public()
  @Get('hotels')
  @ApiOperation({ summary: 'Full-text search hotels with facets' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'starRating', required: false, description: 'Comma-separated star ratings' })
  @ApiQuery({ name: 'amenities', required: false, description: 'Comma-separated amenities' })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lng', required: false })
  @ApiQuery({ name: 'radius', required: false, description: 'e.g. 50km' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['price', 'rating', 'distance'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') query?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('starRating') starRating?: string,
    @Query('amenities') amenities?: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.search({
      query,
      city,
      minPrice,
      maxPrice,
      starRating: starRating ? starRating.split(',').map(Number) : undefined,
      amenities: amenities ? amenities.split(',') : undefined,
      lat,
      lng,
      radius,
      sortBy,
      page,
      limit,
    });
  }
}
