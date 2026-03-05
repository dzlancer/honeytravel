import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

const HOTEL_INDEX = 'hotels';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly esService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      const exists = await this.esService.indices.exists({ index: HOTEL_INDEX });
      if (!exists) {
        await this.createHotelIndex();
      }
    } catch (error) {
      this.logger.warn(`Elasticsearch not available, search features disabled: ${error}`);
    }
  }

  private async createHotelIndex() {
    await this.esService.indices.create({
      index: HOTEL_INDEX,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              hotel_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
        },
        mappings: {
          properties: {
            name: { type: 'text', analyzer: 'hotel_analyzer' },
            description: { type: 'text', analyzer: 'hotel_analyzer' },
            city: { type: 'keyword' },
            country: { type: 'keyword' },
            starRating: { type: 'integer' },
            minPrice: { type: 'float' },
            avgRating: { type: 'float' },
            amenities: { type: 'keyword' },
            location: { type: 'geo_point' },
            supplierId: { type: 'keyword' },
            isActive: { type: 'boolean' },
          },
        },
      },
    });
    this.logger.log('Hotel index created');
  }

  async indexHotel(hotel: Record<string, unknown>) {
    try {
      await this.esService.index({
        index: HOTEL_INDEX,
        id: hotel.id as string,
        body: {
          name: hotel.name,
          description: hotel.description,
          city: hotel.city,
          country: hotel.country,
          starRating: hotel.starRating,
          minPrice: hotel.minPrice,
          avgRating: hotel.avgRating,
          amenities: hotel.amenities,
          location: { lat: hotel.lat, lon: hotel.lng },
          supplierId: hotel.supplierId,
          isActive: hotel.isActive ?? true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index hotel: ${error}`);
    }
  }

  async search(params: {
    query?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    starRating?: number[];
    amenities?: string[];
    lat?: number;
    lng?: number;
    radius?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const { query, city, minPrice, maxPrice, starRating, amenities, lat, lng, radius, sortBy, page = 1, limit = 20 } = params;

    const must: Record<string, unknown>[] = [{ term: { isActive: true } }];
    const filter: Record<string, unknown>[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'description', 'city^2', 'country'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (city) filter.push({ term: { city } });
    if (minPrice || maxPrice) {
      const range: Record<string, number> = {};
      if (minPrice) range.gte = minPrice;
      if (maxPrice) range.lte = maxPrice;
      filter.push({ range: { minPrice: range } });
    }
    if (starRating?.length) {
      filter.push({ terms: { starRating } });
    }
    if (amenities?.length) {
      for (const a of amenities) {
        filter.push({ term: { amenities: a } });
      }
    }
    if (lat && lng) {
      filter.push({
        geo_distance: {
          distance: radius || '50km',
          location: { lat, lon: lng },
        },
      });
    }

    const sort: any[] = [];
    if (sortBy === 'price') sort.push({ minPrice: 'asc' });
    else if (sortBy === 'rating') sort.push({ avgRating: 'desc' });
    else if (sortBy === 'distance' && lat && lng) {
      sort.push({ _geo_distance: { location: { lat, lon: lng }, order: 'asc' } });
    } else {
      sort.push({ _score: 'desc' });
    }

    try {
      const result = await this.esService.search({
        index: HOTEL_INDEX,
        body: {
          query: { bool: { must, filter } },
          sort,
          from: (page - 1) * limit,
          size: limit,
          aggs: {
            price_ranges: {
              range: {
                field: 'minPrice',
                ranges: [
                  { key: '0-100', to: 100 },
                  { key: '100-200', from: 100, to: 200 },
                  { key: '200-500', from: 200, to: 500 },
                  { key: '500+', from: 500 },
                ],
              },
            },
            star_ratings: { terms: { field: 'starRating' } },
            amenities_facet: { terms: { field: 'amenities', size: 20 } },
            cities: { terms: { field: 'city', size: 20 } },
          },
        },
      });

      const hits = result.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));

      const aggs = result.aggregations as Record<string, any>;

      return {
        items: hits,
        total: (result.hits.total as { value: number }).value,
        page,
        limit,
        facets: {
          priceRanges: aggs?.price_ranges?.buckets?.map((b: any) => ({ key: b.key, count: b.doc_count })) || [],
          starRatings: aggs?.star_ratings?.buckets?.map((b: any) => ({ key: String(b.key), count: b.doc_count })) || [],
          amenities: aggs?.amenities_facet?.buckets?.map((b: any) => ({ key: b.key, count: b.doc_count })) || [],
          cities: aggs?.cities?.buckets?.map((b: any) => ({ key: b.key, count: b.doc_count })) || [],
        },
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      return { items: [], total: 0, page, limit, facets: { priceRanges: [], starRatings: [], amenities: [], cities: [] } };
    }
  }
}
