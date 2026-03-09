import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { TourAdapter } from '../interfaces/tour-adapter.interface';
import type {
  Tour, TourSearchCriteria,
  TourCalculationRequest, TourCalculationResponse,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';
import type {
  TSTApiResponse, TSTTourSearchItem, TSTTourDetail,
  TSTGalleryItem, TSTItineraryDay, TSTFacility,
  TSTAvailableDate, TSTCancellationPolicy, TSTChildPolicy,
  TSTCalculationResult, TSTBookingResponse,
} from './travelshopturkey-response.types';

// ─────────────────────────────────────────────────────────────────────────────
// TravelShopTurkey Supplier Adapter
//
// Connects to the TravelShopTurkey REST API and translates their data models
// into the platform-agnostic Tour / Booking types used by our system.
// ─────────────────────────────────────────────────────────────────────────────

export class TravelShopTurkeyAdapter extends TourAdapter {
  readonly supplierId = 'travelshopturkey';

  private readonly logger = new Logger(TravelShopTurkeyAdapter.name);
  private client: AxiosInstance | null = null;
  private apiKey = '';
  private baseUrl = '';

  // ───────────────────────────── lifecycle ──────────────────────────────────

  /**
   * Initialise the HTTP client with the supplier credentials.
   * Must be called before any other method.
   */
  initialize(
    credentials: Record<string, string>,
    config?: Record<string, unknown>,
  ): void {
    this.apiKey = credentials.apiKey;
    this.baseUrl =
      (config?.baseUrl as string) || 'https://travelshopturkey.com/api/json';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15_000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    this.logger.log(
      `TravelShopTurkey adapter initialised — base URL: ${this.baseUrl}`,
    );
  }

  // ───────────────────────────── search ─────────────────────────────────────

  /**
   * Search for tours matching the given criteria.
   * Returns an empty array on failure so callers never receive an exception.
   */
  async searchTours(criteria: TourSearchCriteria): Promise<Tour[]> {
    try {
      this.ensureClient();

      const params: Record<string, string | number> = {};

      if (criteria.destination) params.destination = criteria.destination;
      if (criteria.tourStyle) params.tour_style = criteria.tourStyle;
      if (criteria.minDuration) params.min_duration = criteria.minDuration;
      if (criteria.maxDuration) params.max_duration = criteria.maxDuration;
      if (criteria.minPrice) params.min_price = criteria.minPrice;
      if (criteria.maxPrice) params.max_price = criteria.maxPrice;
      if (criteria.difficulty) params.difficulty = criteria.difficulty;
      if (criteria.page) params.page = criteria.page;
      if (criteria.limit) params.limit = criteria.limit;

      const items = await this.apiGet<TSTTourSearchItem[]>(
        '/tours/search',
        params,
      );

      return (items ?? []).map((item) => this.mapSearchItemToTour(item));
    } catch (error) {
      this.logger.error(
        `searchTours failed: ${this.extractErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      return [];
    }
  }

  // ───────────────────────────── detail ─────────────────────────────────────

  /**
   * Fetch full tour detail by composite id (`tst-{numericId}`).
   * Fires 7 API calls in parallel; only the tour-detail call is mandatory.
   */
  async getTourById(id: string): Promise<Tour | null> {
    try {
      this.ensureClient();

      const numericId = this.extractNumericId(id);
      if (!numericId) {
        this.logger.warn(`Invalid tour id format: ${id}`);
        return null;
      }

      const [
        detailResult,
        galleryResult,
        itineraryResult,
        includesResult,
        excludesResult,
        datesResult,
        cancellationResult,
      ] = await Promise.allSettled([
        this.apiGet<TSTTourDetail>(`/tours/tour/${numericId}`),
        this.apiGet<TSTGalleryItem[]>(`/tours/tourgalleryitems/${numericId}`),
        this.apiGet<TSTItineraryDay[]>(`/tours/touritenaries/${numericId}`),
        this.apiGet<TSTFacility[]>(`/tours/tourfacilityincludes/${numericId}`),
        this.apiGet<TSTFacility[]>(`/tours/tourfacilityexcludes/${numericId}`),
        this.apiGet<TSTAvailableDate[]>(`/tours/touravailableondates/${numericId}`),
        this.apiGet<TSTCancellationPolicy[]>(`/tours/cancellationpolicies/${numericId}`),
      ]);

      // Tour detail is required — bail if it failed
      if (detailResult.status === 'rejected' || !detailResult.value) {
        this.logger.error(
          `Tour detail request failed for id ${numericId}`,
        );
        return null;
      }

      const detail = detailResult.value;

      // Optional enrichment — fall back to empty arrays when calls fail
      const gallery =
        galleryResult.status === 'fulfilled' ? galleryResult.value ?? [] : [];
      const itinerary =
        itineraryResult.status === 'fulfilled' ? itineraryResult.value ?? [] : [];
      const includes =
        includesResult.status === 'fulfilled' ? includesResult.value ?? [] : [];
      const excludes =
        excludesResult.status === 'fulfilled' ? excludesResult.value ?? [] : [];
      const dates =
        datesResult.status === 'fulfilled' ? datesResult.value ?? [] : [];
      const cancellation =
        cancellationResult.status === 'fulfilled'
          ? cancellationResult.value ?? []
          : [];

      return this.mapDetailToTour(
        detail,
        gallery,
        itinerary,
        includes,
        excludes,
        dates,
        cancellation,
      );
    } catch (error) {
      this.logger.error(
        `getTourById failed for ${id}: ${this.extractErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      return null;
    }
  }

  // ───────────────────────────── pricing ────────────────────────────────────

  /**
   * Ask the supplier for a live price calculation.
   */
  async calculatePrice(
    request: TourCalculationRequest,
  ): Promise<TourCalculationResponse> {
    try {
      this.ensureClient();

      const numericId = this.extractNumericId(request.tourId);
      if (!numericId) {
        this.logger.warn(`Invalid tour id for calculation: ${request.tourId}`);
        return this.emptyCalculation();
      }

      const body = {
        tour_id: Number(numericId),
        date: request.date,
        adults: request.adults,
        children: request.children ?? 0,
        child_ages: request.childAges ?? [],
      };

      const result = await this.apiPost<TSTCalculationResult>(
        '/tours/tour_calculation',
        body,
      );

      if (!result) {
        return this.emptyCalculation();
      }

      return {
        available: result.available,
        totalPrice: result.total_price,
        pricePerAdult: result.price_per_adult,
        pricePerChild: result.price_per_child || undefined,
        currency: result.currency || 'EUR',
        supplements: result.supplements ?? [],
      };
    } catch (error) {
      this.logger.error(
        `calculatePrice failed for ${request.tourId}: ${this.extractErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      return this.emptyCalculation();
    }
  }

  // ───────────────────────────── booking ────────────────────────────────────

  /**
   * Create a booking with TravelShopTurkey.
   */
  async createBooking(
    details: SupplierBookingRequest,
  ): Promise<SupplierBookingResponse> {
    try {
      this.ensureClient();

      const numericId = this.extractNumericId(details.hotelId);
      if (!numericId) {
        this.logger.warn(
          `Invalid tour id for booking: ${details.hotelId}`,
        );
        return this.emptyBookingResponse();
      }

      // Map our generic SupplierBookingRequest to TST's expected shape
      const body = {
        tour_id: Number(numericId),
        date: details.checkIn,
        adults: details.guests.map((g) => ({
          first_name: g.firstName,
          last_name: g.lastName,
          email: g.email,
          phone: g.phone || undefined,
        })),
        special_requests: details.specialRequests || undefined,
      };

      const result = await this.apiPost<TSTBookingResponse>(
        '/tours/booking',
        body,
      );

      if (!result) {
        return this.emptyBookingResponse();
      }

      return {
        success: true,
        bookingRef: result.booking_reference,
        confirmationNumber: result.confirmation_number,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(
        `createBooking failed: ${this.extractErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      return this.emptyBookingResponse();
    }
  }

  // ───────────────────────────── cancellation ──────────────────────────────

  /**
   * Cancel an existing booking.
   *
   * NOTE: The TravelShopTurkey cancellation endpoint is still pending
   * confirmation from the supplier. For now we log the attempt and
   * instruct the caller to handle it manually.
   */
  async cancelBooking(
    bookingRef: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.warn(
      `cancelBooking called for ref "${bookingRef}" — ` +
        'cancellation API endpoint is pending confirmation from TravelShopTurkey',
    );

    return {
      success: false,
      message:
        'Cancellation not yet supported — contact TravelShopTurkey directly',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Private helpers — mapping
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Map a search-result item to our normalised Tour type.
   * Search results contain only summary data so many fields are left empty.
   */
  private mapSearchItemToTour(item: TSTTourSearchItem): Tour {
    return {
      id: `tst-${item.id}`,
      supplierId: 'travelshopturkey',
      supplierTourId: String(item.id),
      name: item.tour_name,
      description: item.short_description,
      highlights: [],
      destination: {
        city: item.destination_city,
        country: item.destination_country,
      },
      location: {
        lat: item.latitude || 0,
        lng: item.longitude || 0,
      },
      duration: `${item.duration_days} days / ${item.duration_nights} nights`,
      durationDays: item.duration_days,
      durationNights: item.duration_nights,
      tourStyle: item.tour_style_name,
      groupSize: {
        min: item.min_pax,
        max: item.max_pax,
      },
      difficulty: 'moderate',
      itinerary: [],
      includes: [],
      excludes: [],
      accommodations: [],
      images: item.main_image ? [item.main_image] : [],
      price: item.price,
      priceChild: item.price_child || undefined,
      currency: item.currency || 'EUR',
      availableDates: [],
      cancellationPolicy: '',
      avgRating: item.rating,
      reviewCount: item.review_count,
    };
  }

  /**
   * Map the full detail response (plus enrichment data from parallel calls)
   * into our normalised Tour type.
   */
  private mapDetailToTour(
    detail: TSTTourDetail,
    gallery: TSTGalleryItem[],
    itinerary: TSTItineraryDay[],
    includes: TSTFacility[],
    excludes: TSTFacility[],
    dates: TSTAvailableDate[],
    cancellation: TSTCancellationPolicy[],
  ): Tour {
    // ── highlights ─────────────────────────────────────────────────────────
    const highlights = this.parseHighlights(detail.highlights);

    // ── itinerary ──────────────────────────────────────────────────────────
    const mappedItinerary = itinerary
      .sort((a, b) => a.day_number - b.day_number)
      .map((day) => ({
        day: day.day_number,
        title: day.title,
        description: day.description,
        meals: {
          breakfast: day.breakfast,
          lunch: day.lunch,
          dinner: day.dinner,
        },
        accommodation: day.accommodation_name || undefined,
        locations: day.locations ? this.parseCsvString(day.locations) : undefined,
      }));

    // ── includes / excludes ────────────────────────────────────────────────
    const mappedIncludes = includes.map((f) => f.name);
    const mappedExcludes = excludes.map((f) => f.name);

    // ── images ─────────────────────────────────────────────────────────────
    const sortedGallery = [...gallery].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const imageUrls = sortedGallery.map((g) => g.image_url);
    if (detail.main_image && !imageUrls.includes(detail.main_image)) {
      imageUrls.unshift(detail.main_image);
    }

    // ── available dates ────────────────────────────────────────────────────
    const availableDates = dates
      .filter((d) => d.available_slots > 0)
      .map((d) => d.date);

    // ── cancellation policy ────────────────────────────────────────────────
    const cancellationPolicy = cancellation
      .sort((a, b) => b.days_before - a.days_before)
      .map(
        (p) =>
          `${p.days_before}+ days before: ${p.penalty_percentage}% penalty — ${p.description}`,
      )
      .join('; ');

    // ── guide languages ────────────────────────────────────────────────────
    const guideLanguages = detail.guide_languages
      ? this.parseCsvString(detail.guide_languages)
      : undefined;

    // ── difficulty ──────────────────────────────────────────────────────────
    const difficulty = this.normaliseDifficulty(detail.difficulty);

    return {
      id: `tst-${detail.id}`,
      supplierId: 'travelshopturkey',
      supplierTourId: String(detail.id),
      name: detail.tour_name,
      description: detail.description,
      highlights,
      destination: {
        city: detail.destination_city,
        country: detail.destination_country,
      },
      location: {
        lat: detail.latitude || 0,
        lng: detail.longitude || 0,
      },
      duration: `${detail.duration_days} days / ${detail.duration_nights} nights`,
      durationDays: detail.duration_days,
      durationNights: detail.duration_nights,
      tourStyle: detail.tour_style_name,
      groupSize: {
        min: detail.min_pax,
        max: detail.max_pax,
      },
      difficulty,
      itinerary: mappedItinerary,
      includes: mappedIncludes,
      excludes: mappedExcludes,
      accommodations: this.extractAccommodations(mappedItinerary),
      images: imageUrls,
      price: detail.price,
      priceChild: detail.price_child || undefined,
      currency: detail.currency || 'EUR',
      availableDates,
      cancellationPolicy,
      guideLanguages,
      avgRating: detail.rating,
      reviewCount: detail.review_count,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Private helpers — HTTP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET request wrapper that unwraps the TravelShopTurkey `{ status, data }` envelope.
   */
  private async apiGet<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const response = await this.client!.get<TSTApiResponse<T>>(path, {
      params,
    });
    return response.data.data;
  }

  /**
   * POST request wrapper that unwraps the TravelShopTurkey `{ status, data }` envelope.
   */
  private async apiPost<T>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.client!.post<TSTApiResponse<T>>(path, body);
    return response.data.data;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Private helpers — parsing & utilities
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Parse highlights from the detail record. The API may return either a
   * JSON-encoded array or a newline-/pipe-separated plain-text string.
   */
  private parseHighlights(raw: string | null | undefined): string[] {
    if (!raw) return [];

    // Attempt JSON parse first
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((h: string) => String(h).trim()).filter(Boolean);
      }
    } catch {
      // Not JSON — fall through
    }

    // Fall back to splitting on newlines or pipes
    return raw
      .split(/[\n|]+/)
      .map((h) => h.trim())
      .filter(Boolean);
  }

  /**
   * Split a comma-separated string into a trimmed, non-empty string array.
   */
  private parseCsvString(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * Normalise a free-text difficulty string to our enum.
   */
  private normaliseDifficulty(
    raw: string | null | undefined,
  ): 'easy' | 'moderate' | 'challenging' {
    if (!raw) return 'moderate';
    const lower = raw.toLowerCase().trim();
    if (lower === 'easy' || lower === 'beginner') return 'easy';
    if (lower === 'challenging' || lower === 'hard' || lower === 'difficult') {
      return 'challenging';
    }
    return 'moderate';
  }

  /**
   * Extract unique accommodation entries from the itinerary.
   */
  private extractAccommodations(
    itinerary: { day: number; accommodation?: string }[],
  ): { name: string; type: string; city: string; nights: number }[] {
    const seen = new Map<string, number>();

    for (const day of itinerary) {
      if (!day.accommodation) continue;
      seen.set(day.accommodation, (seen.get(day.accommodation) ?? 0) + 1);
    }

    return Array.from(seen.entries()).map(([name, nights]) => ({
      name,
      type: 'Hotel',
      city: '',
      nights,
    }));
  }

  /**
   * Extract the numeric part from a composite tour id (`tst-{numericId}`).
   * Returns the numeric string or `null` if the format is invalid.
   */
  private extractNumericId(compositeId: string): string | null {
    if (!compositeId) return null;

    // Accept both "tst-123" and plain "123"
    const match = compositeId.match(/^(?:tst-)?(\d+)$/);
    return match ? match[1] : null;
  }

  /**
   * Ensure the HTTP client has been initialised.
   */
  private ensureClient(): void {
    if (!this.client) {
      throw new Error(
        'TravelShopTurkeyAdapter has not been initialised — call initialize() first',
      );
    }
  }

  /**
   * Safely extract an error message from an unknown caught value.
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  // ───────────────────────────── safe defaults ─────────────────────────────

  private emptyCalculation(): TourCalculationResponse {
    return {
      available: false,
      totalPrice: 0,
      pricePerAdult: 0,
      currency: 'EUR',
    };
  }

  private emptyBookingResponse(): SupplierBookingResponse {
    return {
      success: false,
      bookingRef: '',
      status: 'failed',
    };
  }
}
