import { Injectable, Logger } from '@nestjs/common';
import { TourAdapter } from '../interfaces/tour-adapter.interface';
import type {
  Tour, TourSearchCriteria,
  TourCalculationRequest, TourCalculationResponse,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MockTourAdapter extends TourAdapter {
  readonly supplierId = 'mock-tours';
  private readonly logger = new Logger(MockTourAdapter.name);
  private credentials: Record<string, string> = {};

  initialize(credentials: Record<string, string>): void {
    this.credentials = credentials;
    this.logger.log(`MockTourAdapter initialized for supplier: ${this.supplierId}`);
  }

  // Stable IDs for mock tours so detail pages work after search
  private static readonly TOUR_IDS: Record<string, string> = {
    MT001: 'b2c3d4e5-f6a7-8901-bcde-fa2345678001',
    MT002: 'b2c3d4e5-f6a7-8901-bcde-fa2345678002',
    MT003: 'b2c3d4e5-f6a7-8901-bcde-fa2345678003',
    MT004: 'b2c3d4e5-f6a7-8901-bcde-fa2345678004',
    MT005: 'b2c3d4e5-f6a7-8901-bcde-fa2345678005',
    MT006: 'b2c3d4e5-f6a7-8901-bcde-fa2345678006',
    MT007: 'b2c3d4e5-f6a7-8901-bcde-fa2345678007',
    MT008: 'b2c3d4e5-f6a7-8901-bcde-fa2345678008',
  };

  private readonly tours: Tour[] = [
    // ── 1. Cappadocia Hot Air Balloon & Caves ───────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT001,
      supplierId: this.supplierId,
      supplierTourId: 'MT001',
      name: 'Cappadocia Hot Air Balloon & Caves',
      description:
        'Experience the magical landscape of Cappadocia from above in a hot air balloon at sunrise, then explore the ancient cave churches and underground cities carved into the fairy chimneys. This 3-day cultural journey takes you through the heart of central Anatolia.',
      highlights: [
        'Sunrise hot air balloon flight over fairy chimneys',
        'Explore Kaymakli underground city with a local guide',
        'Visit the open-air museum of Goreme with ancient frescoes',
        'Stay in an authentic cave hotel',
      ],
      destination: { city: 'Cappadocia', country: 'Turkey' },
      location: { lat: 38.6431, lng: 34.8289 },
      duration: '3 days / 2 nights',
      durationDays: 3,
      durationNights: 2,
      tourStyle: 'cultural',
      groupSize: { min: 2, max: 16 },
      difficulty: 'easy',
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Goreme Open-Air Museum',
          description:
            'Arrive in Kayseri or Nevsehir airport. Transfer to your cave hotel in Goreme. After settling in, visit the UNESCO-listed Goreme Open-Air Museum with its rock-cut churches and stunning Byzantine frescoes. End the day with a traditional Anatolian dinner.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Cappadocia Cave Suites',
          locations: ['Goreme', 'Goreme Open-Air Museum'],
        },
        {
          day: 2,
          title: 'Balloon Flight & Underground City',
          description:
            'Wake before dawn for the iconic hot air balloon flight over the fairy chimneys at sunrise. After landing, enjoy a celebratory breakfast. In the afternoon, descend into the ancient Kaymakli Underground City, exploring its eight levels of tunnels and chambers.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Cappadocia Cave Suites',
          locations: ['Cappadocia Valley', 'Kaymakli Underground City'],
        },
        {
          day: 3,
          title: 'Devrent Valley & Departure',
          description:
            'Morning visit to the surreal Devrent Imagination Valley and the three-headed fairy chimney at Pasabag. Browse local pottery workshops in Avanos before your airport transfer.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Devrent Valley', 'Pasabag', 'Avanos'],
        },
      ],
      includes: [
        'Hot air balloon flight',
        'Professional English-speaking guide',
        'All entrance fees',
        '2 nights cave hotel accommodation',
        'Airport transfers',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'International or domestic flights',
        'Travel insurance',
        'Personal expenses and souvenirs',
        'Tips for guides and drivers',
      ],
      accommodations: [
        { name: 'Cappadocia Cave Suites', type: 'Boutique Cave Hotel', starRating: 4, city: 'Goreme', nights: 2 },
      ],
      images: [
        'https://picsum.photos/seed/tour-cappadocia-1/800/600',
        'https://picsum.photos/seed/tour-cappadocia-2/800/600',
        'https://picsum.photos/seed/tour-cappadocia-3/800/600',
      ],
      price: 299,
      priceChild: 199,
      currency: 'EUR',
      availableDates: [
        '2025-04-15', '2025-05-10', '2025-06-07', '2025-07-12',
        '2025-08-16', '2025-09-13', '2025-10-04', '2025-10-25',
      ],
      cancellationPolicy: 'Free cancellation up to 7 days before departure. 50% refund 3-7 days before. No refund within 3 days.',
      childPolicy: 'Children aged 6-12 receive a discounted rate. Children under 6 are not permitted on balloon flights.',
      avgRating: 4.8,
      reviewCount: 412,
      guideLanguages: ['English', 'Turkish', 'French'],
    },

    // ── 2. Ephesus & Pamukkale Heritage ─────────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT002,
      supplierId: this.supplierId,
      supplierTourId: 'MT002',
      name: 'Ephesus & Pamukkale Heritage',
      description:
        'Journey through two of Turkey\'s most iconic UNESCO World Heritage Sites. Walk the marble streets of ancient Ephesus, one of the best-preserved Roman cities, then soak in the thermal pools of Pamukkale\'s white travertine terraces.',
      highlights: [
        'Guided tour of the ancient city of Ephesus',
        'Visit the Temple of Artemis ruins, one of the Seven Wonders',
        'Bathe in Pamukkale\'s natural thermal travertine pools',
        'Explore the ancient city of Hierapolis',
      ],
      destination: { city: 'Kusadasi', country: 'Turkey' },
      location: { lat: 37.9394, lng: 27.3417 },
      duration: '4 days / 3 nights',
      durationDays: 4,
      durationNights: 3,
      tourStyle: 'cultural',
      groupSize: { min: 2, max: 20 },
      difficulty: 'easy',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Kusadasi',
          description:
            'Arrive at Izmir airport and transfer to your hotel in Kusadasi. Free afternoon to explore the charming port town and its bazaar. Welcome dinner at a seaside restaurant.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Kusadasi Grand Hotel',
          locations: ['Izmir Airport', 'Kusadasi'],
        },
        {
          day: 2,
          title: 'Ancient Ephesus & Sirince Village',
          description:
            'Full-day exploration of Ephesus. Walk through the Library of Celsus, the Great Theatre, and the Terrace Houses. Visit the nearby Temple of Artemis ruins. Afternoon visit to the picturesque Greek village of Sirince for wine tasting.',
          meals: { breakfast: true, lunch: true, dinner: false },
          accommodation: 'Kusadasi Grand Hotel',
          locations: ['Ephesus', 'Temple of Artemis', 'Sirince Village'],
        },
        {
          day: 3,
          title: 'Pamukkale & Hierapolis',
          description:
            'Drive to Pamukkale and marvel at the white calcium terraces cascading down the hillside. Walk barefoot through the warm thermal pools. Explore the ancient Roman city of Hierapolis and its vast necropolis at the top of the terraces.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Pamukkale Thermal Hotel',
          locations: ['Pamukkale Travertines', 'Hierapolis', 'Cleopatra Pool'],
        },
        {
          day: 4,
          title: 'Aphrodisias & Departure',
          description:
            'Morning visit to the well-preserved ruins of Aphrodisias with its stunning stadium and sculptors\' workshop. Transfer to Izmir airport for your departure.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Aphrodisias', 'Izmir Airport'],
        },
      ],
      includes: [
        'Professional English-speaking guide',
        'All entrance fees to archaeological sites',
        '3 nights hotel accommodation',
        'Air-conditioned transport',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'Flights to/from Izmir',
        'Travel insurance',
        'Personal expenses',
        'Tips for guides and drivers',
      ],
      accommodations: [
        { name: 'Kusadasi Grand Hotel', type: 'Hotel', starRating: 4, city: 'Kusadasi', nights: 2 },
        { name: 'Pamukkale Thermal Hotel', type: 'Thermal Hotel', starRating: 4, city: 'Pamukkale', nights: 1 },
      ],
      images: [
        'https://picsum.photos/seed/tour-ephesus-1/800/600',
        'https://picsum.photos/seed/tour-ephesus-2/800/600',
        'https://picsum.photos/seed/tour-ephesus-3/800/600',
      ],
      price: 449,
      priceChild: 299,
      currency: 'EUR',
      availableDates: [
        '2025-03-22', '2025-04-19', '2025-05-17', '2025-06-14',
        '2025-09-06', '2025-10-11', '2025-11-01',
      ],
      cancellationPolicy: 'Free cancellation up to 10 days before departure. 50% refund 5-10 days before. No refund within 5 days.',
      childPolicy: 'Children aged 5-12 receive a discounted rate. Children under 5 travel free without a separate bed.',
      avgRating: 4.6,
      reviewCount: 287,
      guideLanguages: ['English', 'Turkish'],
    },

    // ── 3. Istanbul Grand Discovery ─────────────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT003,
      supplierId: this.supplierId,
      supplierTourId: 'MT003',
      name: 'Istanbul Grand Discovery',
      description:
        'Immerse yourself in the city where East meets West. This comprehensive 5-day tour covers Istanbul\'s greatest treasures from Ottoman palaces and Byzantine basilicas to vibrant bazaars and Bosphorus cruises.',
      highlights: [
        'Skip-the-line entry to Hagia Sophia and Topkapi Palace',
        'Private Bosphorus sunset cruise',
        'Guided tour of the Grand Bazaar with a local artisan',
        'Traditional Turkish bath (hammam) experience',
        'Taste tour through Istanbul\'s street food scene',
      ],
      destination: { city: 'Istanbul', country: 'Turkey' },
      location: { lat: 41.0082, lng: 28.9784 },
      duration: '5 days / 4 nights',
      durationDays: 5,
      durationNights: 4,
      tourStyle: 'cultural',
      groupSize: { min: 2, max: 14 },
      difficulty: 'easy',
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Sultanahmet',
          description:
            'Arrive in Istanbul and transfer to your hotel in the historic Sultanahmet district. Afternoon orientation walk through the Hippodrome and the Blue Mosque. Welcome dinner at a rooftop restaurant with views of the Bosphorus.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Sultanahmet Palace Hotel',
          locations: ['Istanbul Airport', 'Sultanahmet', 'Blue Mosque', 'Hippodrome'],
        },
        {
          day: 2,
          title: 'Hagia Sophia & Topkapi Palace',
          description:
            'Morning visit to the awe-inspiring Hagia Sophia with skip-the-line access. Explore Topkapi Palace, including the Harem and the treasury with the Spoonmaker\'s Diamond. Afternoon in the Basilica Cistern.',
          meals: { breakfast: true, lunch: true, dinner: false },
          accommodation: 'Sultanahmet Palace Hotel',
          locations: ['Hagia Sophia', 'Topkapi Palace', 'Basilica Cistern'],
        },
        {
          day: 3,
          title: 'Grand Bazaar & Spice Market',
          description:
            'Guided tour of the Grand Bazaar with a local artisan who reveals hidden workshops. Continue to the Egyptian Spice Market. Afternoon street food tasting tour through Eminonu and Karakoy neighborhoods.',
          meals: { breakfast: true, lunch: true, dinner: false },
          accommodation: 'Sultanahmet Palace Hotel',
          locations: ['Grand Bazaar', 'Spice Market', 'Eminonu', 'Karakoy'],
        },
        {
          day: 4,
          title: 'Bosphorus Cruise & Asian Side',
          description:
            'Morning Bosphorus cruise passing waterfront mansions and the Rumeli Fortress. Disembark on the Asian side to explore Kadikoy\'s colorful markets. Traditional Turkish hammam experience in the afternoon. Farewell dinner.',
          meals: { breakfast: true, lunch: false, dinner: true },
          accommodation: 'Sultanahmet Palace Hotel',
          locations: ['Bosphorus', 'Rumeli Fortress', 'Kadikoy', 'Turkish Hammam'],
        },
        {
          day: 5,
          title: 'Chora Church & Departure',
          description:
            'Morning visit to the stunning mosaics and frescoes of the Chora Church (Kariye Museum). Free time for last-minute shopping before airport transfer.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Chora Church', 'Istanbul Airport'],
        },
      ],
      includes: [
        'Professional English-speaking guide',
        'Skip-the-line entry to all major attractions',
        '4 nights boutique hotel accommodation',
        'Private Bosphorus sunset cruise',
        'Turkish hammam session',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'International flights',
        'Travel insurance',
        'Personal shopping and souvenirs',
        'Tips for guides and drivers',
      ],
      accommodations: [
        { name: 'Sultanahmet Palace Hotel', type: 'Boutique Hotel', starRating: 4, city: 'Istanbul', nights: 4 },
      ],
      images: [
        'https://picsum.photos/seed/tour-istanbul-1/800/600',
        'https://picsum.photos/seed/tour-istanbul-2/800/600',
        'https://picsum.photos/seed/tour-istanbul-3/800/600',
      ],
      price: 599,
      priceChild: 399,
      currency: 'EUR',
      availableDates: [
        '2025-03-15', '2025-04-12', '2025-05-03', '2025-06-21',
        '2025-08-09', '2025-09-20', '2025-10-18', '2025-11-15',
      ],
      cancellationPolicy: 'Free cancellation up to 14 days before departure. 50% refund 7-14 days before. No refund within 7 days.',
      childPolicy: 'Children aged 4-12 receive a discounted rate. Children under 4 travel free.',
      avgRating: 4.9,
      reviewCount: 534,
      guideLanguages: ['English', 'Turkish', 'French', 'Arabic'],
    },

    // ── 4. Eastern Turkey Adventure ─────────────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT004,
      supplierId: this.supplierId,
      supplierTourId: 'MT004',
      name: 'Eastern Turkey Adventure',
      description:
        'Venture off the beaten path into Turkey\'s wild east. This challenging 8-day expedition takes you from the ancient city of Mardin to the summit of Mount Nemrut, through the dramatic landscapes of Lake Van and the remote Ishak Pasha Palace.',
      highlights: [
        'Sunrise at the colossal stone heads on Mount Nemrut',
        'Explore the fairy-tale Ishak Pasha Palace near Dogubayazit',
        'Swim in the turquoise waters of Lake Van',
        'Discover the ancient Syriac monasteries of Mardin',
        'Visit Akdamar Island and its 10th-century Armenian church',
      ],
      destination: { city: 'Van', country: 'Turkey' },
      location: { lat: 38.4945, lng: 43.3832 },
      duration: '8 days / 7 nights',
      durationDays: 8,
      durationNights: 7,
      tourStyle: 'adventure',
      groupSize: { min: 4, max: 12 },
      difficulty: 'challenging',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Mardin',
          description:
            'Fly into Mardin and transfer to your hotel in the old city. Afternoon orientation walk through the honey-colored stone streets with views over the Mesopotamian plains.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Mardin Stone House Hotel',
          locations: ['Mardin Airport', 'Mardin Old City'],
        },
        {
          day: 2,
          title: 'Mardin Monasteries & Midyat',
          description:
            'Visit the ancient Deyrulzafaran Monastery and the Syriac Orthodox churches. Drive to the silver-working town of Midyat. Explore the Mor Gabriel Monastery, one of the oldest functioning monasteries in the world.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Mardin Stone House Hotel',
          locations: ['Deyrulzafaran Monastery', 'Midyat', 'Mor Gabriel Monastery'],
        },
        {
          day: 3,
          title: 'Hasankeyf & Drive to Nemrut',
          description:
            'Visit the ancient settlement of Hasankeyf on the Tigris River. Continue northwest toward Mount Nemrut, stopping at historic caravanserais along the route.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Nemrut Kervansaray Hotel',
          locations: ['Hasankeyf', 'Tigris River', 'Adiyaman'],
        },
        {
          day: 4,
          title: 'Mount Nemrut Sunrise',
          description:
            'Pre-dawn drive to the summit of Mount Nemrut (2,134m). Watch the sunrise illuminate the colossal stone heads of the ancient Commagene kingdom. Descend and explore the Arsemia ruins. Drive east toward Lake Van.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Van Lakeside Hotel',
          locations: ['Mount Nemrut Summit', 'Arsemia', 'Lake Van'],
        },
        {
          day: 5,
          title: 'Lake Van & Akdamar Island',
          description:
            'Morning boat trip to Akdamar Island to see the beautifully carved 10th-century Armenian Church of the Holy Cross. Afternoon free to swim in the alkaline waters of Lake Van. Visit Van Castle at sunset.',
          meals: { breakfast: true, lunch: false, dinner: true },
          accommodation: 'Van Lakeside Hotel',
          locations: ['Akdamar Island', 'Church of the Holy Cross', 'Van Castle'],
        },
        {
          day: 6,
          title: 'Dogubayazit & Ishak Pasha Palace',
          description:
            'Drive north to Dogubayazit with views of Mount Ararat (5,137m). Tour the fairy-tale Ishak Pasha Palace perched on a hilltop. Optional sunset hike for views of the mountain.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Dogubayazit Mountain Hotel',
          locations: ['Dogubayazit', 'Ishak Pasha Palace', 'Mount Ararat viewpoint'],
        },
        {
          day: 7,
          title: 'Ani Ruins & Kars',
          description:
            'Drive to the atmospheric ghost city of Ani on the Armenian border. Explore the medieval churches and city walls. Continue to Kars for its Ottoman architecture and famous local honey.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Kars Heritage Hotel',
          locations: ['Ani Ruins', 'Kars'],
        },
        {
          day: 8,
          title: 'Kars & Departure',
          description:
            'Morning visit to Kars Castle and the local cheese market. Transfer to Kars airport for departure.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Kars Castle', 'Kars Airport'],
        },
      ],
      includes: [
        'Professional English-speaking guide specializing in eastern Turkey',
        'All entrance fees and boat transfers',
        '7 nights hotel accommodation',
        '4x4 vehicle transport throughout',
        'Meals as indicated in itinerary',
        'Domestic airport transfers',
      ],
      excludes: [
        'Domestic and international flights',
        'Travel insurance (highly recommended)',
        'Personal expenses and souvenirs',
        'Tips for guides and drivers',
      ],
      accommodations: [
        { name: 'Mardin Stone House Hotel', type: 'Boutique Hotel', starRating: 4, city: 'Mardin', nights: 2 },
        { name: 'Nemrut Kervansaray Hotel', type: 'Hotel', starRating: 3, city: 'Adiyaman', nights: 1 },
        { name: 'Van Lakeside Hotel', type: 'Hotel', starRating: 4, city: 'Van', nights: 2 },
        { name: 'Dogubayazit Mountain Hotel', type: 'Hotel', starRating: 3, city: 'Dogubayazit', nights: 1 },
        { name: 'Kars Heritage Hotel', type: 'Hotel', starRating: 3, city: 'Kars', nights: 1 },
      ],
      images: [
        'https://picsum.photos/seed/tour-eastern-1/800/600',
        'https://picsum.photos/seed/tour-eastern-2/800/600',
        'https://picsum.photos/seed/tour-eastern-3/800/600',
      ],
      price: 899,
      priceChild: 649,
      currency: 'EUR',
      availableDates: [
        '2025-05-10', '2025-06-07', '2025-07-05', '2025-08-02',
        '2025-08-30', '2025-09-20',
      ],
      cancellationPolicy: 'Free cancellation up to 21 days before departure. 50% refund 10-21 days before. No refund within 10 days.',
      childPolicy: 'Children must be at least 10 years old due to the challenging nature of this tour.',
      avgRating: 4.7,
      reviewCount: 156,
      guideLanguages: ['English', 'Turkish'],
    },

    // ── 5. Turkish Riviera Beach & History ──────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT005,
      supplierId: this.supplierId,
      supplierTourId: 'MT005',
      name: 'Turkish Riviera Beach & History',
      description:
        'Combine sun-soaked beaches with ancient ruins along Turkey\'s stunning turquoise coast. Sail on a traditional gulet, explore sunken cities, and relax on pristine Mediterranean beaches from Antalya to Kas.',
      highlights: [
        'Two-day gulet cruise along the turquoise coast',
        'Swim over the sunken city of Kekova',
        'Explore the ancient Lycian rock tombs at Myra',
        'Relax on Kaputas Beach, one of Turkey\'s most beautiful',
        'Visit the ancient theatre at Aspendos',
      ],
      destination: { city: 'Antalya', country: 'Turkey' },
      location: { lat: 36.8969, lng: 30.7133 },
      duration: '6 days / 5 nights',
      durationDays: 6,
      durationNights: 5,
      tourStyle: 'beach',
      groupSize: { min: 2, max: 16 },
      difficulty: 'easy',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Antalya',
          description:
            'Arrive in Antalya and transfer to your beachfront hotel. Afternoon at leisure to enjoy the hotel pool or Konyaalti Beach. Evening walk through the charming Kaleici old town.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Antalya Beach Resort',
          locations: ['Antalya Airport', 'Konyaalti Beach', 'Kaleici Old Town'],
        },
        {
          day: 2,
          title: 'Aspendos & Perge',
          description:
            'Morning visit to the perfectly preserved Roman theatre of Aspendos. Continue to the ancient city of Perge. Afternoon return to the hotel for beach relaxation.',
          meals: { breakfast: true, lunch: true, dinner: false },
          accommodation: 'Antalya Beach Resort',
          locations: ['Aspendos Theatre', 'Perge', 'Antalya'],
        },
        {
          day: 3,
          title: 'Gulet Cruise Day 1 — Demre & Myra',
          description:
            'Drive to Demre and visit the ancient Lycian rock tombs at Myra and the Church of St. Nicholas. Board your traditional gulet for an afternoon cruise, stopping for swimming in secluded bays.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Gulet Yacht (private cabin)',
          locations: ['Demre', 'Myra Rock Tombs', 'Church of St. Nicholas'],
        },
        {
          day: 4,
          title: 'Gulet Cruise Day 2 — Kekova & Kas',
          description:
            'Cruise over the sunken city of Kekova, visible through crystal-clear waters. Kayak along the coastline past Lycian sarcophagi. Disembark in the charming town of Kas for a free evening.',
          meals: { breakfast: true, lunch: true, dinner: false },
          accommodation: 'Kas Boutique Hotel',
          locations: ['Kekova Sunken City', 'Simena Castle', 'Kas'],
        },
        {
          day: 5,
          title: 'Kaputas Beach & Patara',
          description:
            'Morning at stunning Kaputas Beach, a turquoise cove between towering cliffs. Visit the ancient city and 18km-long beach of Patara, birthplace of St. Nicholas. Farewell dinner in Kas.',
          meals: { breakfast: true, lunch: false, dinner: true },
          accommodation: 'Kas Boutique Hotel',
          locations: ['Kaputas Beach', 'Patara', 'Kas'],
        },
        {
          day: 6,
          title: 'Kas & Departure',
          description:
            'Free morning to explore Kas\'s boutiques and waterfront cafes. Transfer to Antalya airport for departure.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Kas', 'Antalya Airport'],
        },
      ],
      includes: [
        'Professional English-speaking guide',
        'All entrance fees',
        '3 nights hotel + 1 night gulet accommodation',
        'Gulet cruise with crew and meals',
        'Air-conditioned transport',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'Flights to/from Antalya',
        'Travel insurance',
        'Personal expenses, water sports, and souvenirs',
        'Tips for guides, drivers, and boat crew',
      ],
      accommodations: [
        { name: 'Antalya Beach Resort', type: 'Beach Resort', starRating: 5, city: 'Antalya', nights: 2 },
        { name: 'Gulet Yacht', type: 'Traditional Yacht', city: 'Kekova Coast', nights: 1 },
        { name: 'Kas Boutique Hotel', type: 'Boutique Hotel', starRating: 4, city: 'Kas', nights: 2 },
      ],
      images: [
        'https://picsum.photos/seed/tour-riviera-1/800/600',
        'https://picsum.photos/seed/tour-riviera-2/800/600',
        'https://picsum.photos/seed/tour-riviera-3/800/600',
      ],
      price: 699,
      priceChild: 479,
      currency: 'EUR',
      availableDates: [
        '2025-05-01', '2025-05-24', '2025-06-14', '2025-07-05',
        '2025-07-26', '2025-08-16', '2025-09-06', '2025-09-27',
      ],
      cancellationPolicy: 'Free cancellation up to 14 days before departure. 50% refund 7-14 days before. No refund within 7 days.',
      childPolicy: 'Children aged 5-12 receive a discounted rate. Children under 5 travel free. Life jackets provided for all ages on gulet.',
      avgRating: 4.7,
      reviewCount: 328,
      guideLanguages: ['English', 'Turkish', 'French'],
    },

    // ── 6. Black Sea Highlands Trek ─────────────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT006,
      supplierId: this.supplierId,
      supplierTourId: 'MT006',
      name: 'Black Sea Highlands Trek',
      description:
        'Trek through the lush green highlands of Turkey\'s Black Sea coast. This challenging 7-day adventure takes you through misty mountain pastures (yaylas), alpine lakes, centuries-old monasteries, and tea plantations far from the tourist trail.',
      highlights: [
        'Trek through the Kackar Mountains reaching 3,000m altitude',
        'Visit the cliffside Sumela Monastery',
        'Stay in traditional Black Sea highland villages',
        'Experience authentic yayla (mountain pasture) culture',
        'Taste fresh Black Sea cuisine and local tea',
      ],
      destination: { city: 'Trabzon', country: 'Turkey' },
      location: { lat: 41.0027, lng: 39.7168 },
      duration: '7 days / 6 nights',
      durationDays: 7,
      durationNights: 6,
      tourStyle: 'adventure',
      groupSize: { min: 4, max: 10 },
      difficulty: 'challenging',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Trabzon',
          description:
            'Arrive in Trabzon. Visit the Hagia Sophia of Trabzon (Ayasofya Museum). Explore the city\'s old quarter and taste local pide. Evening briefing about the trek ahead.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Trabzon Hilltop Hotel',
          locations: ['Trabzon Airport', 'Trabzon Ayasofya', 'Trabzon Old Quarter'],
        },
        {
          day: 2,
          title: 'Sumela Monastery & Uzungol',
          description:
            'Visit the breathtaking Sumela Monastery, perched on a sheer cliff face in the Altindere Valley. Continue to the picture-perfect lake village of Uzungol surrounded by forested mountains.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Uzungol Lake Lodge',
          locations: ['Sumela Monastery', 'Altindere Valley', 'Uzungol'],
        },
        {
          day: 3,
          title: 'Ayder Plateau & Hot Springs',
          description:
            'Drive through the tea plantations and lush valleys to the Ayder Plateau. Soak in the natural hot springs. Afternoon acclimatization walk in the lower Kackar foothills.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Ayder Highland Pension',
          locations: ['Tea Plantations', 'Ayder Plateau', 'Kackar Foothills'],
        },
        {
          day: 4,
          title: 'Kackar Trek Day 1 — Kavron Valley',
          description:
            'Begin the trek from Ayder into the Kavron Valley. Hike through alpine meadows and rhododendron forests. Reach the first mountain camp near glacial lakes at 2,500m.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Mountain Camp (tented)',
          locations: ['Kavron Valley', 'Alpine Meadows', 'Glacial Lakes'],
        },
        {
          day: 5,
          title: 'Kackar Trek Day 2 — Summit Attempt',
          description:
            'Early start for the optional summit attempt of Mount Kackar (3,937m). Those not summiting can explore the high lakes area. Descend to the camp for a celebratory evening.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Mountain Camp (tented)',
          locations: ['Mount Kackar', 'High Lakes', 'Summit Ridge'],
        },
        {
          day: 6,
          title: 'Descent & Pokut Yayla',
          description:
            'Descend through the mountain trails to the traditional yayla village of Pokut. Experience authentic highland hospitality. Taste freshly made muhlama (local cheese fondue) and Black Sea cornbread.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Pokut Yayla Guesthouse',
          locations: ['Kackar Trail', 'Pokut Yayla'],
        },
        {
          day: 7,
          title: 'Tea Gardens & Departure',
          description:
            'Morning visit to a local tea garden to learn about Black Sea tea production. Transfer to Trabzon airport for departure.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Tea Garden', 'Trabzon Airport'],
        },
      ],
      includes: [
        'Professional mountain guide with wilderness first-aid certification',
        'All entrance fees',
        '4 nights hotel/pension + 2 nights tented camp',
        'Trekking equipment (tents, cooking gear)',
        'All transport including 4x4 transfers',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'Flights to/from Trabzon',
        'Travel and trekking insurance (mandatory)',
        'Personal trekking gear (boots, backpack, clothing)',
        'Tips for guides and porters',
      ],
      accommodations: [
        { name: 'Trabzon Hilltop Hotel', type: 'Hotel', starRating: 3, city: 'Trabzon', nights: 1 },
        { name: 'Uzungol Lake Lodge', type: 'Lodge', starRating: 3, city: 'Uzungol', nights: 1 },
        { name: 'Ayder Highland Pension', type: 'Pension', city: 'Ayder', nights: 1 },
        { name: 'Pokut Yayla Guesthouse', type: 'Guesthouse', city: 'Pokut', nights: 1 },
      ],
      images: [
        'https://picsum.photos/seed/tour-blacksea-1/800/600',
        'https://picsum.photos/seed/tour-blacksea-2/800/600',
        'https://picsum.photos/seed/tour-blacksea-3/800/600',
      ],
      price: 749,
      priceChild: 549,
      currency: 'EUR',
      availableDates: [
        '2025-06-14', '2025-07-05', '2025-07-19', '2025-08-02',
        '2025-08-16', '2025-09-06',
      ],
      cancellationPolicy: 'Free cancellation up to 21 days before departure. 50% refund 10-21 days before. No refund within 10 days.',
      childPolicy: 'Minimum age 14 years due to the challenging trekking conditions.',
      avgRating: 4.5,
      reviewCount: 98,
      guideLanguages: ['English', 'Turkish'],
    },

    // ── 7. Lycian Way Hiking ────────────────────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT007,
      supplierId: this.supplierId,
      supplierTourId: 'MT007',
      name: 'Lycian Way Hiking',
      description:
        'Hike the best sections of the Lycian Way, one of the world\'s top long-distance trails. This 5-day moderate adventure follows ancient paths along the Mediterranean coast, past Lycian ruins, pine forests, and secluded beaches.',
      highlights: [
        'Hike scenic sections of the famous Lycian Way trail',
        'Discover hidden beaches accessible only on foot',
        'Explore ancient Lycian ruins along the trail',
        'Summit Mount Olympos (Tahtali) by cable car',
      ],
      destination: { city: 'Fethiye', country: 'Turkey' },
      location: { lat: 36.6520, lng: 29.1168 },
      duration: '5 days / 4 nights',
      durationDays: 5,
      durationNights: 4,
      tourStyle: 'adventure',
      groupSize: { min: 4, max: 12 },
      difficulty: 'moderate',
      itinerary: [
        {
          day: 1,
          title: 'Fethiye & Oludeniz',
          description:
            'Arrive in Dalaman and transfer to Fethiye. Afternoon visit to the Lycian rock tombs overlooking the town. Drive to the famous Blue Lagoon at Oludeniz for a sunset swim.',
          meals: { breakfast: false, lunch: false, dinner: true },
          accommodation: 'Oludeniz Hillside Hotel',
          locations: ['Dalaman Airport', 'Fethiye Rock Tombs', 'Oludeniz Blue Lagoon'],
        },
        {
          day: 2,
          title: 'Lycian Way: Oludeniz to Kabak',
          description:
            'Begin the Lycian Way hike from Oludeniz. Trek through pine forests with stunning coastal panoramas. Pass the ghost village of Kayakoy. Descend to the secluded Kabak Beach for overnight.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Kabak Valley Camp',
          locations: ['Oludeniz', 'Kayakoy Ghost Village', 'Kabak Beach'],
        },
        {
          day: 3,
          title: 'Lycian Way: Kabak to Patara',
          description:
            'Continue along the trail through fragrant pine and carob forests. Pass the ancient Lycian city of Sidyma with its carved sarcophagi. Arrive at the vast 18km beach of Patara.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Patara Village Pension',
          locations: ['Kabak', 'Sidyma Ruins', 'Patara Beach'],
        },
        {
          day: 4,
          title: 'Lycian Way: Olympos & Chimaera',
          description:
            'Transfer to the Olympos section of the Lycian Way. Explore the ancient ruins of Olympos nestled in a gorge. Evening hike to the eternal flames of Chimaera (Yanartas), natural gas vents that have burned for millennia.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Olympos Treehouse Lodge',
          locations: ['Olympos Ruins', 'Chimaera Flames', 'Cirali Beach'],
        },
        {
          day: 5,
          title: 'Mount Tahtali & Departure',
          description:
            'Morning cable car ride to the summit of Mount Tahtali (Olympos) at 2,365m for panoramic views of the coast. Descend and transfer to Antalya airport.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Mount Tahtali', 'Antalya Airport'],
        },
      ],
      includes: [
        'Professional hiking guide with Lycian Way expertise',
        'All entrance fees and cable car ticket',
        '4 nights varied accommodation',
        'Luggage transfers between stops',
        'Air-conditioned transport for non-hiking transfers',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'Flights to Dalaman / from Antalya',
        'Travel and hiking insurance',
        'Personal hiking equipment',
        'Tips for guides',
      ],
      accommodations: [
        { name: 'Oludeniz Hillside Hotel', type: 'Hotel', starRating: 3, city: 'Oludeniz', nights: 1 },
        { name: 'Kabak Valley Camp', type: 'Eco Camp', city: 'Kabak', nights: 1 },
        { name: 'Patara Village Pension', type: 'Pension', starRating: 3, city: 'Patara', nights: 1 },
        { name: 'Olympos Treehouse Lodge', type: 'Treehouse Lodge', city: 'Olympos', nights: 1 },
      ],
      images: [
        'https://picsum.photos/seed/tour-lycian-1/800/600',
        'https://picsum.photos/seed/tour-lycian-2/800/600',
        'https://picsum.photos/seed/tour-lycian-3/800/600',
      ],
      price: 549,
      priceChild: 389,
      currency: 'EUR',
      availableDates: [
        '2025-03-29', '2025-04-19', '2025-05-10', '2025-06-07',
        '2025-09-13', '2025-10-04', '2025-10-25', '2025-11-08',
      ],
      cancellationPolicy: 'Free cancellation up to 14 days before departure. 50% refund 7-14 days before. No refund within 7 days.',
      childPolicy: 'Minimum age 12 years. Children must be accompanied by a parent/guardian and capable of hiking 15km per day.',
      avgRating: 4.6,
      reviewCount: 203,
      guideLanguages: ['English', 'Turkish', 'French'],
    },

    // ── 8. Gallipoli & Troy Historical ──────────────────────
    {
      id: MockTourAdapter.TOUR_IDS.MT008,
      supplierId: this.supplierId,
      supplierTourId: 'MT008',
      name: 'Gallipoli & Troy Historical',
      description:
        'Walk through the pages of history on this poignant 3-day tour covering two of Turkey\'s most significant historical sites. Visit the Gallipoli battlefields where the Anzac legend was born, then explore the legendary ancient city of Troy.',
      highlights: [
        'Guided tour of the Gallipoli battlefields and Anzac Cove',
        'Visit Lone Pine and Chunuk Bair memorials',
        'Explore the archaeological layers of ancient Troy',
        'See the reconstructed Trojan Horse',
      ],
      destination: { city: 'Canakkale', country: 'Turkey' },
      location: { lat: 40.1553, lng: 26.4142 },
      duration: '3 days / 2 nights',
      durationDays: 3,
      durationNights: 2,
      tourStyle: 'cultural',
      groupSize: { min: 2, max: 20 },
      difficulty: 'easy',
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Gallipoli Battlefields',
          description:
            'Depart from Istanbul early morning and cross the Dardanelles by ferry. Spend the afternoon touring the Gallipoli Peninsula: visit Anzac Cove, Lone Pine Cemetery, the Nek, and Chunuk Bair. A moving experience brought to life by your expert guide.',
          meals: { breakfast: false, lunch: true, dinner: true },
          accommodation: 'Canakkale Waterfront Hotel',
          locations: ['Istanbul', 'Dardanelles Ferry', 'Anzac Cove', 'Lone Pine', 'Chunuk Bair'],
        },
        {
          day: 2,
          title: 'Troy & Dardanelles',
          description:
            'Morning visit to the legendary city of Troy (Truva). Explore the nine archaeological layers spanning 4,000 years. See the reconstructed Trojan Horse and the museum. Afternoon visit to the Dardanelles strait and the Cimenlik Castle.',
          meals: { breakfast: true, lunch: true, dinner: true },
          accommodation: 'Canakkale Waterfront Hotel',
          locations: ['Troy', 'Troy Museum', 'Cimenlik Castle', 'Dardanelles'],
        },
        {
          day: 3,
          title: 'Assos & Departure',
          description:
            'Morning visit to the ancient hilltop city of Assos with its Temple of Athena and stunning Aegean views. Return to Istanbul or transfer to Canakkale airport.',
          meals: { breakfast: true, lunch: false, dinner: false },
          locations: ['Assos', 'Temple of Athena', 'Istanbul'],
        },
      ],
      includes: [
        'Professional English-speaking historian guide',
        'All entrance fees',
        '2 nights hotel accommodation',
        'Ferry crossing of the Dardanelles',
        'Air-conditioned transport from/to Istanbul',
        'Meals as indicated in itinerary',
      ],
      excludes: [
        'International flights',
        'Travel insurance',
        'Personal expenses and souvenirs',
        'Tips for guides and drivers',
      ],
      accommodations: [
        { name: 'Canakkale Waterfront Hotel', type: 'Hotel', starRating: 4, city: 'Canakkale', nights: 2 },
      ],
      images: [
        'https://picsum.photos/seed/tour-gallipoli-1/800/600',
        'https://picsum.photos/seed/tour-gallipoli-2/800/600',
        'https://picsum.photos/seed/tour-gallipoli-3/800/600',
      ],
      price: 349,
      priceChild: 239,
      currency: 'EUR',
      availableDates: [
        '2025-03-15', '2025-04-12', '2025-04-25', '2025-05-17',
        '2025-06-14', '2025-09-06', '2025-10-11', '2025-11-08',
      ],
      cancellationPolicy: 'Free cancellation up to 7 days before departure. 50% refund 3-7 days before. No refund within 3 days.',
      childPolicy: 'Children aged 5-12 receive a discounted rate. Children under 5 travel free without a separate bed.',
      avgRating: 4.4,
      reviewCount: 267,
      guideLanguages: ['English', 'Turkish', 'Arabic'],
    },
  ];

  async searchTours(criteria: TourSearchCriteria): Promise<Tour[]> {
    this.logger.log(`Searching tours: ${JSON.stringify(criteria)}`);

    let results = this.tours.filter((tour) => {
      // Filter by destination (case-insensitive contains on city, country, or name)
      if (criteria.destination) {
        const dest = criteria.destination.toLowerCase();
        const matchesDestination =
          tour.destination.city.toLowerCase().includes(dest) ||
          tour.destination.country.toLowerCase().includes(dest) ||
          tour.name.toLowerCase().includes(dest);
        if (!matchesDestination) return false;
      }

      // Filter by tour style (exact match)
      if (criteria.tourStyle && tour.tourStyle !== criteria.tourStyle) {
        return false;
      }

      // Filter by difficulty (exact match)
      if (criteria.difficulty && tour.difficulty !== criteria.difficulty) {
        return false;
      }

      // Filter by min duration
      if (criteria.minDuration && tour.durationDays < criteria.minDuration) {
        return false;
      }

      // Filter by max duration
      if (criteria.maxDuration && tour.durationDays > criteria.maxDuration) {
        return false;
      }

      // Filter by min price
      if (criteria.minPrice && tour.price < criteria.minPrice) {
        return false;
      }

      // Filter by max price
      if (criteria.maxPrice && tour.price > criteria.maxPrice) {
        return false;
      }

      return true;
    });

    // Sort results
    if (criteria.sortBy) {
      const order = criteria.sortOrder === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        switch (criteria.sortBy) {
          case 'price':
            return (a.price - b.price) * order;
          case 'rating':
            return (a.avgRating - b.avgRating) * order;
          case 'duration':
            return (a.durationDays - b.durationDays) * order;
          default:
            return 0;
        }
      });
    }

    // Pagination
    const page = criteria.page ?? 1;
    const limit = criteria.limit ?? 20;
    const start = (page - 1) * limit;
    results = results.slice(start, start + limit);

    return results;
  }

  async getTourById(id: string): Promise<Tour | null> {
    return this.tours.find((t) => t.id === id) || null;
  }

  async calculatePrice(request: TourCalculationRequest): Promise<TourCalculationResponse> {
    this.logger.log(`Calculating tour price: ${JSON.stringify(request)}`);

    const tour = this.tours.find((t) => t.id === request.tourId);
    if (!tour) {
      return {
        available: false,
        totalPrice: 0,
        pricePerAdult: 0,
        currency: 'EUR',
      };
    }

    const pricePerAdult = tour.price;
    const pricePerChild = tour.priceChild ?? Math.round(tour.price * 0.7);
    const childrenCount = request.children ?? 0;
    const totalPrice = pricePerAdult * request.adults + pricePerChild * childrenCount;
    const available = tour.availableDates.includes(request.date);

    return {
      available,
      totalPrice,
      pricePerAdult,
      pricePerChild,
      currency: tour.currency,
      supplements: [
        { name: 'Single room supplement', price: 75 },
        { name: 'Airport VIP transfer upgrade', price: 40 },
      ],
    };
  }

  async createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse> {
    this.logger.log(`Creating tour booking: ${JSON.stringify(details)}`);
    return {
      success: true,
      bookingRef: `MOCK-TOUR-${uuid().slice(0, 8).toUpperCase()}`,
      confirmationNumber: `TC-${Date.now()}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Cancelling tour booking: ${bookingRef}`);
    return { success: true, message: `Tour booking ${bookingRef} cancelled successfully` };
  }
}
