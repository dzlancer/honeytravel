import { Injectable, Logger } from '@nestjs/common';
import { SupplierAdapter } from '../interfaces/supplier-adapter.interface';
import {
  SearchCriteria, AvailabilityRequest, AvailabilityResponse,
  SupplierBookingRequest, SupplierBookingResponse, Hotel,
} from '../../../../../shared/types/supplier';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MockHotelAdapter extends SupplierAdapter {
  readonly supplierId = 'mock-hotels';
  private readonly logger = new Logger(MockHotelAdapter.name);
  private credentials: Record<string, string> = {};

  initialize(credentials: Record<string, string>): void {
    this.credentials = credentials;
    this.logger.log(`MockHotelAdapter initialized for supplier: ${this.supplierId}`);
  }

  // Stable IDs for mock hotels so detail pages work after search
  private static readonly HOTEL_IDS: Record<string, string> = {
    MH001: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
    MH002: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
    MH003: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
    MH004: 'a1b2c3d4-e5f6-7890-abcd-ef1234567004',
    MH005: 'a1b2c3d4-e5f6-7890-abcd-ef1234567005',
    MH006: 'a1b2c3d4-e5f6-7890-abcd-ef1234567006',
    MH007: 'a1b2c3d4-e5f6-7890-abcd-ef1234567007',
    MH008: 'a1b2c3d4-e5f6-7890-abcd-ef1234567008',
    MH009: 'a1b2c3d4-e5f6-7890-abcd-ef1234567009',
    MH010: 'a1b2c3d4-e5f6-7890-abcd-ef1234567010',
    MH011: 'a1b2c3d4-e5f6-7890-abcd-ef1234567011',
    MH012: 'a1b2c3d4-e5f6-7890-abcd-ef1234567012',
  };

  async searchHotels(criteria: SearchCriteria): Promise<Hotel[]> {
    this.logger.log(`Searching hotels: ${JSON.stringify(criteria)}`);

    const mockHotels: Hotel[] = [
      {
        id: MockHotelAdapter.HOTEL_IDS.MH001,
        supplierId: this.supplierId,
        supplierHotelId: "MH001",
        name: "Grand Hotel Algiers",
        description: "Luxurious 5-star hotel in Algiers with stunning Mediterranean views near the Martyrs Memorial and the Casbah.",
        starRating: 5,
        address: { street: "1 Boulevard Che Guevara", city: "Algiers", country: 'Algeria' },
        location: { lat: 36.7538, lng: 3.0588 },
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
        amenities: ["wifi","pool","spa","restaurant","gym","parking","room_service","concierge"],
        rooms: [
          { id: "R001", name: "Standard Sea View", description: "Comfortable room with Mediterranean views", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 250, currency: 'USD', available: true },
          { id: "R002", name: "Superior Room", description: "Spacious room with premium furnishings", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 300, currency: 'USD', available: true },
          { id: "R003", name: "Presidential Suite", description: "Luxury suite with jacuzzi", maxOccupancy: 4, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 370, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.7, reviewCount: 342, minPrice: 250, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH002,
        supplierId: this.supplierId,
        supplierHotelId: "MH002",
        name: "Sahara Oasis Resort",
        description: "Unique desert resort in Ghardaia with traditional Mzab Valley architecture and Saharan hospitality.",
        starRating: 4,
        address: { street: "Route de Ghardaia", city: "Ghardaia", country: 'Algeria' },
        location: { lat: 32.4912, lng: 3.6735 },
        images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"],
        amenities: ["wifi","pool","restaurant","spa","parking","garden"],
        rooms: [
          { id: "R004", name: "Standard Desert Room", description: "Traditional room with desert views", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 120, currency: 'USD', available: true },
          { id: "R005", name: "Superior Courtyard Room", description: "Room overlooking the palm courtyard", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 170, currency: 'USD', available: true },
          { id: "R006", name: "Oasis Suite", description: "Spacious suite with private terrace", maxOccupancy: 3, bedType: "King + Daybed", amenities: ["wifi","minibar"], images: [], pricePerNight: 240, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"15:00","checkOutTime":"11:00","cancellationPolicy":"Free cancellation up to 48h before check-in"},
        avgRating: 4.3, reviewCount: 128, minPrice: 120, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH003,
        supplierId: this.supplierId,
        supplierHotelId: "MH003",
        name: "Constantine Cliff Hotel",
        description: "Modern 4-star hotel above the dramatic Rhumel Gorge with panoramic views of the suspension bridge.",
        starRating: 4,
        address: { street: "Boulevard Zighoud Youcef", city: "Constantine", country: 'Algeria' },
        location: { lat: 36.365, lng: 6.6147 },
        images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800","https://images.unsplash.com/photo-1618773928121-c32f082f97da?w=800"],
        amenities: ["wifi","restaurant","gym","parking","conference_room","bar"],
        rooms: [
          { id: "R007", name: "Standard Gorge View", description: "Room with views of the Rhumel Gorge", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 150, currency: 'USD', available: true },
          { id: "R008", name: "Superior Bridge View", description: "Premium room facing the suspension bridge", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 200, currency: 'USD', available: true },
          { id: "R009", name: "Cliff Suite", description: "Corner suite with panoramic gorge views", maxOccupancy: 3, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 270, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.5, reviewCount: 215, minPrice: 150, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH004,
        supplierId: this.supplierId,
        supplierHotelId: "MH004",
        name: "Hotel El Aurassi",
        description: "Iconic 5-star landmark overlooking the Bay of Algiers with rooftop restaurant near the Botanical Garden.",
        starRating: 5,
        address: { street: "2 Boulevard Frantz Fanon", city: "Algiers", country: 'Algeria' },
        location: { lat: 36.747, lng: 3.057 },
        images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800","https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"],
        amenities: ["wifi","pool","spa","restaurant","gym","parking","room_service","business_center","rooftop_bar"],
        rooms: [
          { id: "R010", name: "Standard Bay View", description: "Elegant room with Bay of Algiers panorama", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 280, currency: 'USD', available: true },
          { id: "R011", name: "Superior Deluxe", description: "Refined room with premium amenities", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 330, currency: 'USD', available: true },
          { id: "R012", name: "Aurassi Suite", description: "Signature suite with wraparound terrace", maxOccupancy: 4, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 400, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.6, reviewCount: 489, minPrice: 280, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH005,
        supplierId: this.supplierId,
        supplierHotelId: "MH005",
        name: "Le Meridien Oran",
        description: "Prestigious 5-star seafront hotel in Oran with views of the Santa Cruz Fort near the Front de Mer.",
        starRating: 5,
        address: { street: "1 Place du 1er Novembre", city: "Oran", country: 'Algeria' },
        location: { lat: 35.6969, lng: -0.6331 },
        images: ["https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"],
        amenities: ["wifi","pool","spa","restaurant","gym","parking","room_service","beach_access","concierge"],
        rooms: [
          { id: "R013", name: "Standard Mediterranean", description: "Bright room with Mediterranean Sea views", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 220, currency: 'USD', available: true },
          { id: "R014", name: "Superior Sea Front", description: "Premium room with sea-facing balcony", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 270, currency: 'USD', available: true },
          { id: "R015", name: "Meridien Suite", description: "Luxurious suite with panoramic sea views", maxOccupancy: 4, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 340, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.8, reviewCount: 376, minPrice: 220, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH006,
        supplierId: this.supplierId,
        supplierHotelId: "MH006",
        name: "Tassili Hotel Djanet",
        description: "Charming 3-star hotel near Tassili National Park with Tuareg-inspired decor and Tadrart Rouge views.",
        starRating: 3,
        address: { street: "Avenue de la Republique", city: "Djanet", country: 'Algeria' },
        location: { lat: 24.5525, lng: 9.4848 },
        images: ["https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800","https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"],
        amenities: ["wifi","restaurant","parking","garden","tour_desk"],
        rooms: [
          { id: "R016", name: "Standard Desert Room", description: "Simple room with Saharan views", maxOccupancy: 2, bedType: "Twin", amenities: ["wifi","minibar"], images: [], pricePerNight: 85, currency: 'USD', available: true },
          { id: "R017", name: "Superior Tassili Room", description: "Room with traditional Tuareg decor", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 135, currency: 'USD', available: true },
          { id: "R018", name: "Djanet Suite", description: "Rooftop suite with desert terrace", maxOccupancy: 3, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 205, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 72h before check-in"},
        avgRating: 4.1, reviewCount: 87, minPrice: 85, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH007,
        supplierId: this.supplierId,
        supplierHotelId: "MH007",
        name: "Royal Hotel Tlemcen",
        description: "Elegant 4-star hotel in Tlemcen, the Pearl of the Maghreb, near the Great Mosque and Mansourah ruins.",
        starRating: 4,
        address: { street: "Rue de Independence", city: "Tlemcen", country: 'Algeria' },
        location: { lat: 34.8828, lng: -1.3167 },
        images: ["https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"],
        amenities: ["wifi","restaurant","parking","spa","garden","conference_room"],
        rooms: [
          { id: "R019", name: "Standard Heritage Room", description: "Classic room with Andalusian decor", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 130, currency: 'USD', available: true },
          { id: "R020", name: "Superior Garden View", description: "Room overlooking the Andalusian garden", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 180, currency: 'USD', available: true },
          { id: "R021", name: "Royal Suite", description: "Ornate suite with Moorish details", maxOccupancy: 3, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 250, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.4, reviewCount: 163, minPrice: 130, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH008,
        supplierId: this.supplierId,
        supplierHotelId: "MH008",
        name: "Bejaia Beach Resort",
        description: "Seaside 4-star resort in Bejaia overlooking Cap Carbon with beach access and views of Yemma Gouraya.",
        starRating: 4,
        address: { street: "Route de la Corniche", city: "Bejaia", country: 'Algeria' },
        location: { lat: 36.7515, lng: 5.0847 },
        images: ["https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=800","https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"],
        amenities: ["wifi","pool","restaurant","beach_access","water_sports","parking","spa"],
        rooms: [
          { id: "R022", name: "Standard Beach Room", description: "Comfortable room near the beach", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 160, currency: 'USD', available: true },
          { id: "R023", name: "Superior Sea View", description: "Room with panoramic Mediterranean views", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 210, currency: 'USD', available: true },
          { id: "R024", name: "Beach Suite", description: "Suite with beach access and private terrace", maxOccupancy: 4, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 280, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.5, reviewCount: 198, minPrice: 160, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH009,
        supplierId: this.supplierId,
        supplierHotelId: "MH009",
        name: "Hotel Cirta Constantine",
        description: "Well-located 3-star hotel in Constantine near the Ahmed Bey Palace and Souq el-Ghzel market.",
        starRating: 3,
        address: { street: "Rue Didouche Mourad", city: "Constantine", country: 'Algeria' },
        location: { lat: 36.3654, lng: 6.6145 },
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800","https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800"],
        amenities: ["wifi","restaurant","parking","laundry"],
        rooms: [
          { id: "R025", name: "Standard City Room", description: "Clean room in the city center", maxOccupancy: 2, bedType: "Twin", amenities: ["wifi","minibar"], images: [], pricePerNight: 95, currency: 'USD', available: true },
          { id: "R026", name: "Superior Room", description: "Upgraded room with city views", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 145, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4, reviewCount: 102, minPrice: 95, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH010,
        supplierId: this.supplierId,
        supplierHotelId: "MH010",
        name: "Timgad Heritage Inn",
        description: "Cozy 3-star inn near the UNESCO-listed Roman ruins of Timgad founded by Emperor Trajan in 100 AD.",
        starRating: 3,
        address: { street: "Route de Timgad", city: "Batna", country: 'Algeria' },
        location: { lat: 35.4849, lng: 6.4685 },
        images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
        amenities: ["wifi","restaurant","parking","garden","tour_desk"],
        rooms: [
          { id: "R027", name: "Standard Heritage Room", description: "Simple room with local stone decor", maxOccupancy: 2, bedType: "Twin", amenities: ["wifi","minibar"], images: [], pricePerNight: 75, currency: 'USD', available: true },
          { id: "R028", name: "Superior Room", description: "Room with garden views", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 125, currency: 'USD', available: true },
          { id: "R029", name: "Heritage Suite", description: "Suite with views toward Timgad ruins", maxOccupancy: 3, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 195, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 48h before check-in"},
        avgRating: 4.2, reviewCount: 74, minPrice: 75, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH011,
        supplierId: this.supplierId,
        supplierHotelId: "MH011",
        name: "Setif Park Hotel",
        description: "Contemporary 4-star hotel in Setif overlooking the Ain El Fouara fountain park near the Roman site of Djemila.",
        starRating: 4,
        address: { street: "Avenue du 1er Novembre", city: "Setif", country: 'Algeria' },
        location: { lat: 36.1898, lng: 5.4108 },
        images: ["https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800","https://images.unsplash.com/photo-1521783988139-89397d761dce?w=800"],
        amenities: ["wifi","restaurant","gym","parking","conference_room","bar"],
        rooms: [
          { id: "R030", name: "Standard Park View", description: "Room overlooking the central park", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 110, currency: 'USD', available: true },
          { id: "R031", name: "Superior Room", description: "Modern room with upgraded furnishings", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 160, currency: 'USD', available: true },
          { id: "R032", name: "Park Suite", description: "Suite with living area and park panorama", maxOccupancy: 3, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 230, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.3, reviewCount: 145, minPrice: 110, currency: 'USD',
      },
      {
        id: MockHotelAdapter.HOTEL_IDS.MH012,
        supplierId: this.supplierId,
        supplierHotelId: "MH012",
        name: "Tipaza Sea View",
        description: "Charming 4-star coastal hotel in Tipaza with views of the UNESCO-listed Roman ruins and Mediterranean coast.",
        starRating: 4,
        address: { street: "Chemin des Ruines Romaines", city: "Tipaza", country: 'Algeria' },
        location: { lat: 36.5906, lng: 2.4469 },
        images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800","https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800"],
        amenities: ["wifi","restaurant","pool","parking","beach_access","garden"],
        rooms: [
          { id: "R033", name: "Standard Room", description: "Comfortable room with garden views", maxOccupancy: 2, bedType: "Queen", amenities: ["wifi","minibar"], images: [], pricePerNight: 140, currency: 'USD', available: true },
          { id: "R034", name: "Superior Sea View", description: "Room with Mediterranean and ruins views", maxOccupancy: 2, bedType: "King", amenities: ["wifi","minibar"], images: [], pricePerNight: 190, currency: 'USD', available: true },
          { id: "R035", name: "Tipaza Suite", description: "Suite overlooking the Roman ruins and sea", maxOccupancy: 3, bedType: "King + Sofa", amenities: ["wifi","minibar"], images: [], pricePerNight: 260, currency: 'USD', available: true },
        ],
        policies: {"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"},
        avgRating: 4.4, reviewCount: 201, minPrice: 140, currency: 'USD',
      },
    ];

    // Simple filter by destination
    return mockHotels.filter((h) => {
      if (criteria.destination) {
        const dest = criteria.destination.toLowerCase();
        return h.address.city.toLowerCase().includes(dest)
          || h.address.country.toLowerCase().includes(dest)
          || h.name.toLowerCase().includes(dest);
      }
      return true;
    });
  }

  async getHotelById(id: string): Promise<Hotel | null> {
    const allHotels = await this.searchHotels({ destination: '', checkIn: '', checkOut: '', guests: 2 });
    return allHotels.find((h) => h.id === id) || null;
  }

  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    this.logger.log(`Checking availability: ${JSON.stringify(request)}`);
    const hotel = await this.getHotelById(request.hotelId);
    const rooms = hotel ? hotel.rooms : [];
    const price = rooms.length > 0 ? rooms[0].pricePerNight : 100;
    return {
      available: true,
      rooms: rooms.length > 0 ? rooms : [
        { id: 'R001', name: 'Standard Room', description: 'Standard room', maxOccupancy: 2, bedType: 'Queen',
          amenities: ['wifi', 'minibar'], images: [], pricePerNight: price, currency: 'USD', available: true },
      ],
      totalPrice: price * this.calculateNights(request.checkIn, request.checkOut),
      currency: 'USD',
    };
  }

  async createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse> {
    this.logger.log(`Creating booking: ${JSON.stringify(details)}`);
    return {
      success: true,
      bookingRef: `MOCK-${uuid().slice(0, 8).toUpperCase()}`,
      confirmationNumber: `CN-${Date.now()}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Cancelling booking: ${bookingRef}`);
    return { success: true, message: `Booking ${bookingRef} cancelled successfully` };
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }
}