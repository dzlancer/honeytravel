export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  priceRanges: FacetBucket[];
  starRatings: FacetBucket[];
  amenities: FacetBucket[];
  cities: FacetBucket[];
}

export interface FacetBucket {
  key: string;
  count: number;
  label?: string;
}
