import { Injectable, Logger } from '@nestjs/common';
import { ActivityAdapter } from '../interfaces/activity-adapter.interface';
import {
  ActivitySearchCriteria, Activity,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MockActivityAdapter extends ActivityAdapter {
  readonly supplierId = 'mock-activities';
  private readonly logger = new Logger(MockActivityAdapter.name);

  initialize(credentials: Record<string, string>): void {
    this.logger.log('MockActivityAdapter initialized');
  }

  private static readonly ACTIVITY_IDS: Record<string, string> = {
    SAHARA: 'a1c2t3v4-d5e6-7890-abcd-activity00001',
    CASBAH: 'a1c2t3v4-d5e6-7890-abcd-activity00002',
    TIMGAD: 'a1c2t3v4-d5e6-7890-abcd-activity00003',
    TASSILI: 'a1c2t3v4-d5e6-7890-abcd-activity00004',
    DJEMILA: 'a1c2t3v4-d5e6-7890-abcd-activity00005',
    DIVING: 'a1c2t3v4-d5e6-7890-abcd-activity00006',
    TLEMCEN: 'a1c2t3v4-d5e6-7890-abcd-activity00007',
    STARGAZING: 'a1c2t3v4-d5e6-7890-abcd-activity00008',
  };

  private getMockActivities(): Activity[] {
    return [
      {
        id: MockActivityAdapter.ACTIVITY_IDS.SAHARA,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-SAHARA-01",
        name: "Sahara Camel Trek",
        description: "Experience the magic of the Sahara Desert on a guided camel trek through the golden dunes of Ghardaia. Watch a breathtaking sunset over the desert, enjoy traditional Tuareg tea, and learn about the ancient caravan routes that once crossed this magnificent landscape.",
        category: "adventure",
        destination: { city: "Ghardaia", country: 'Algeria' },
        location: { lat: 32.4912, lng: 3.6735 },
        duration: "4 hours",
        groupSize: { min: 2, max: 12 },
        difficulty: "moderate",
        includes: ["Licensed desert guide","Camel ride","Traditional Tuareg tea","Bottled water","Sand boarding gear","Hotel pickup & drop-off"],
        images: [
          "https://images.unsplash.com/photo-1549221987-25a490f65d34?w=800",
          "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
        ],
        price: 45,
        currency: 'USD',
        avgRating: 4.8,
        reviewCount: 234,
        schedule: ["Daily at 15:00","Sunset tours at 17:00"],
        cancellationPolicy: "Free cancellation up to 24 hours before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.CASBAH,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-CASBAH-01",
        name: "Casbah Walking Tour",
        description: "Explore the UNESCO World Heritage Casbah of Algiers with an expert local guide. Wander through the labyrinthine streets of the old city, discover Ottoman-era palaces, traditional artisan workshops, and panoramic Mediterranean views from this ancient hilltop citadel.",
        category: "cultural",
        destination: { city: "Algiers", country: 'Algeria' },
        location: { lat: 36.7853, lng: 3.06 },
        duration: "3 hours",
        groupSize: { min: 1, max: 15 },
        difficulty: "easy",
        includes: ["Licensed heritage guide","Museum entry fees","Traditional mint tea stop","Photo opportunities"],
        images: [
          "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
          "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800",
        ],
        price: 25,
        currency: 'USD',
        avgRating: 4.6,
        reviewCount: 412,
        schedule: ["Daily at 09:00","Daily at 14:00"],
        cancellationPolicy: "Free cancellation up to 12 hours before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.TIMGAD,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-TIMGAD-01",
        name: "Timgad Roman Ruins Visit",
        description: "Journey to the remarkably preserved Roman city of Timgad, founded by Emperor Trajan in 100 AD. This UNESCO World Heritage site features an intact grid layout, a 3,500-seat theater, the iconic Trajan Arch, and stunning mosaics that bring ancient Roman Algeria to life.",
        category: "cultural",
        destination: { city: "Batna", country: 'Algeria' },
        location: { lat: 35.4849, lng: 6.4685 },
        duration: "Full day (8 hours)",
        groupSize: { min: 2, max: 20 },
        difficulty: "easy",
        includes: ["Round-trip transport from Batna","Licensed archaeologist guide","Site entry fees","Lunch at local restaurant","Bottled water"],
        images: [
          "https://images.unsplash.com/photo-1563789031959-4c02bcb21862?w=800",
          "https://images.unsplash.com/photo-1608306448197-e133bcb4be76?w=800",
        ],
        price: 55,
        currency: 'USD',
        avgRating: 4.9,
        reviewCount: 178,
        schedule: ["Tue, Thu, Sat at 08:00"],
        cancellationPolicy: "Free cancellation up to 48 hours before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.TASSILI,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-TASSILI-01",
        name: "Tassili N'Ajjer Hiking",
        description: "Embark on an unforgettable 2-day hiking expedition through the Tassili N'Ajjer National Park, a UNESCO World Heritage site. Discover prehistoric rock art dating back 12,000 years, traverse dramatic sandstone formations, and camp under one of the clearest night skies on Earth.",
        category: "nature",
        destination: { city: "Djanet", country: 'Algeria' },
        location: { lat: 25.0584, lng: 8 },
        duration: "2 days",
        groupSize: { min: 4, max: 10 },
        difficulty: "challenging",
        includes: ["Expert mountain guide","Camping equipment","All meals (2 lunches, 1 dinner, 1 breakfast)","Park entry permits","First aid kit","4x4 transfer to trailhead"],
        images: [
          "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800",
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        ],
        price: 180,
        currency: 'USD',
        avgRating: 4.7,
        reviewCount: 89,
        schedule: ["Mon and Wed departures, March-November"],
        cancellationPolicy: "Free cancellation up to 7 days before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.DJEMILA,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-DJEMILA-01",
        name: "Djemila Archaeological Tour",
        description: "Explore the stunning UNESCO-listed Roman ruins of Djemila, one of the finest examples of Roman urban planning in North Africa. Walk through ancient forums, temples, and basilicas with spectacular mountain backdrops.",
        category: "cultural",
        destination: { city: "Setif", country: 'Algeria' },
        location: { lat: 36.3214, lng: 5.7369 },
        duration: "6 hours",
        groupSize: { min: 2, max: 15 },
        difficulty: "easy",
        includes: ["Licensed archaeologist guide","Site entry fees","Transport from Setif","Lunch at local restaurant","Bottled water"],
        images: [
          "https://images.unsplash.com/photo-1563789031959-4c02bcb21862?w=800",
          "https://images.unsplash.com/photo-1608306448197-e133bcb4be76?w=800",
        ],
        price: 50,
        currency: 'USD',
        avgRating: 4.8,
        reviewCount: 145,
        schedule: ["Mon, Wed, Fri, Sat at 08:30"],
        cancellationPolicy: "Free cancellation up to 48 hours before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.DIVING,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-DIVING-01",
        name: "Mediterranean Diving",
        description: "Discover underwater treasures of the Mediterranean off the coast of Bejaia. Explore coral reefs, underwater caves, and vibrant marine life near the dramatic cliffs of Cap Carbon.",
        category: "adventure",
        destination: { city: "Bejaia", country: 'Algeria' },
        location: { lat: 36.7515, lng: 5.0847 },
        duration: "3 hours",
        groupSize: { min: 2, max: 8 },
        difficulty: "moderate",
        includes: ["PADI-certified instructor","Full diving equipment","Underwater photos","Insurance","Boat transfer to dive site"],
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        ],
        price: 70,
        currency: 'USD',
        avgRating: 4.5,
        reviewCount: 98,
        schedule: ["Daily at 09:00, May-October"],
        cancellationPolicy: "Free cancellation up to 24 hours before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.TLEMCEN,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-TLEMCEN-01",
        name: "Tlemcen Heritage Walk",
        description: "Discover the architectural treasures of Tlemcen, the Pearl of the Maghreb. Visit the Great Mosque, Mansourah ruins, and Andalusian gardens that reflect centuries of Islamic civilization.",
        category: "cultural",
        destination: { city: "Tlemcen", country: 'Algeria' },
        location: { lat: 34.8828, lng: -1.3167 },
        duration: "4 hours",
        groupSize: { min: 2, max: 12 },
        difficulty: "easy",
        includes: ["Licensed heritage guide","All entry fees","Traditional pastry tasting","Mint tea stop"],
        images: [
          "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800",
          "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        ],
        price: 35,
        currency: 'USD',
        avgRating: 4.6,
        reviewCount: 112,
        schedule: ["Daily at 09:00","Daily at 14:00"],
        cancellationPolicy: "Free cancellation up to 24 hours before",
      },
      {
        id: MockActivityAdapter.ACTIVITY_IDS.STARGAZING,
        supplierId: this.supplierId,
        supplierActivityId: "ACT-STARGAZING-01",
        name: "Sahara Stargazing Night",
        description: "Experience one of the clearest night skies on Earth in the Sahara near Tamanrasset. Includes telescope viewing of planets and deep-sky objects, plus an overnight traditional desert camp.",
        category: "nature",
        destination: { city: "Tamanrasset", country: 'Algeria' },
        location: { lat: 22.785, lng: 5.5228 },
        duration: "1 night",
        groupSize: { min: 2, max: 10 },
        difficulty: "easy",
        includes: ["Professional astronomer guide","Telescope and binoculars","Traditional Tuareg dinner","Desert camp with bedding","Morning breakfast","4x4 desert transfer"],
        images: [
          "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
          "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800",
        ],
        price: 95,
        currency: 'USD',
        avgRating: 4.9,
        reviewCount: 67,
        schedule: ["Nightly, September-May (clear sky conditions)"],
        cancellationPolicy: "Free cancellation up to 48 hours before",
      },
    ];
  }

  async searchActivities(criteria: ActivitySearchCriteria): Promise<Activity[]> {
    this.logger.log(`Searching activities: ${JSON.stringify(criteria)}`);
    const activities = this.getMockActivities();

    return activities.filter((a) => {
      if (criteria.destination) {
        const dest = criteria.destination.toLowerCase();
        if (!a.destination.city.toLowerCase().includes(dest) &&
            !a.destination.country.toLowerCase().includes(dest) &&
            !a.name.toLowerCase().includes(dest)) {
          return false;
        }
      }
      if (criteria.category && a.category !== criteria.category) return false;
      if (criteria.difficulty && a.difficulty !== criteria.difficulty) return false;
      if (criteria.minPrice && a.price < criteria.minPrice) return false;
      if (criteria.maxPrice && a.price > criteria.maxPrice) return false;
      return true;
    });
  }

  async getActivityById(id: string): Promise<Activity | null> {
    return this.getMockActivities().find((a) => a.id === id) || null;
  }

  async createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse> {
    this.logger.log(`Creating activity booking: ${JSON.stringify(details)}`);
    return {
      success: true,
      bookingRef: `MOCK-ACT-${uuid().slice(0, 8).toUpperCase()}`,
      confirmationNumber: `ACT-${Date.now()}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Cancelling activity booking: ${bookingRef}`);
    return { success: true, message: `Activity booking ${bookingRef} cancelled successfully` };
  }
}