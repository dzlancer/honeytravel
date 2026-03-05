import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { encrypt } from '../../config/encryption.util';

dotenv.config();

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'tsa_user',
    password: process.env.DB_PASSWORD || 'tsa_password',
    database: process.env.DB_DATABASE || 'travel_shop_algeria',
  });

  await ds.initialize();

  // Seed admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  await ds.query(`
    INSERT INTO users (email, "passwordHash", "firstName", "lastName", role, "isEmailVerified")
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email) DO NOTHING
  `, ['admin@travelshopalgeria.com', passwordHash, 'Admin', 'User', 'admin', true]);

  // Seed mock supplier
  const credentials = encrypt(JSON.stringify({ apiKey: 'mock-api-key-12345', secret: 'mock-secret' }));
  await ds.query(`
    INSERT INTO suppliers (code, name, type, "baseUrl", "encryptedCredentials", "rateLimit", timeout)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (code) DO NOTHING
  `, ['mock-hotels', 'Mock Hotel Supplier', 'hotel', 'http://localhost:3001/api/mock-supplier', credentials, 60, 10000]);

  // Seed sample hotels
  const hotels = [
    {
      supplierId: 'mock-hotels',
      supplierHotelId: 'MH001',
      name: 'Grand Hotel Algiers',
      description: 'Luxurious 5-star hotel in the heart of Algiers with stunning Mediterranean views.',
      starRating: 5,
      street: '1 Boulevard Che Guevara',
      city: 'Algiers',
      country: 'Algeria',
      lat: 36.7538,
      lng: 3.0588,
      images: JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']),
      amenities: JSON.stringify(['wifi', 'pool', 'spa', 'restaurant', 'gym', 'parking', 'room_service']),
      rooms: JSON.stringify([
        { id: 'R001', name: 'Deluxe Sea View', description: 'Spacious room with Mediterranean views', maxOccupancy: 2, bedType: 'King', amenities: ['wifi', 'minibar', 'balcony'], images: [], pricePerNight: 250, currency: 'USD' },
        { id: 'R002', name: 'Premium Suite', description: 'Luxury suite with separate living area', maxOccupancy: 4, bedType: 'King + Sofa', amenities: ['wifi', 'minibar', 'balcony', 'jacuzzi'], images: [], pricePerNight: 450, currency: 'USD' },
      ]),
      policies: JSON.stringify({ checkInTime: '14:00', checkOutTime: '12:00', cancellationPolicy: 'Free cancellation up to 24h before check-in' }),
      avgRating: 4.7,
      reviewCount: 342,
      minPrice: 250,
    },
    {
      supplierId: 'mock-hotels',
      supplierHotelId: 'MH002',
      name: 'Sahara Oasis Resort',
      description: 'Unique desert resort experience in Ghardaia with traditional architecture.',
      starRating: 4,
      street: 'Route de Ghardaia',
      city: 'Ghardaia',
      country: 'Algeria',
      lat: 32.4912,
      lng: 3.6735,
      images: JSON.stringify(['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800']),
      amenities: JSON.stringify(['wifi', 'pool', 'restaurant', 'spa', 'parking']),
      rooms: JSON.stringify([
        { id: 'R003', name: 'Desert View Room', description: 'Traditional room with desert views', maxOccupancy: 2, bedType: 'Queen', amenities: ['wifi', 'minibar'], images: [], pricePerNight: 120, currency: 'USD' },
      ]),
      policies: JSON.stringify({ checkInTime: '15:00', checkOutTime: '11:00', cancellationPolicy: 'Free cancellation up to 48h before check-in' }),
      avgRating: 4.3,
      reviewCount: 128,
      minPrice: 120,
    },
    {
      supplierId: 'mock-hotels',
      supplierHotelId: 'MH003',
      name: 'Constantine Cliff Hotel',
      description: 'Modern hotel perched above the dramatic gorges of Constantine.',
      starRating: 4,
      street: 'Boulevard Zighoud Youcef',
      city: 'Constantine',
      country: 'Algeria',
      lat: 36.3650,
      lng: 6.6147,
      images: JSON.stringify(['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800']),
      amenities: JSON.stringify(['wifi', 'restaurant', 'gym', 'parking', 'conference_room']),
      rooms: JSON.stringify([
        { id: 'R004', name: 'Gorge View Room', description: 'Room with views of the Rhumel Gorge', maxOccupancy: 2, bedType: 'King', amenities: ['wifi', 'minibar'], images: [], pricePerNight: 150, currency: 'USD' },
      ]),
      policies: JSON.stringify({ checkInTime: '14:00', checkOutTime: '12:00', cancellationPolicy: 'Free cancellation up to 24h before check-in' }),
      avgRating: 4.5,
      reviewCount: 215,
      minPrice: 150,
    },
  ];

  for (const hotel of hotels) {
    await ds.query(`
      INSERT INTO hotels ("supplierId", "supplierHotelId", name, description, "starRating",
        street, city, country, lat, lng, images, amenities, rooms, policies,
        "avgRating", "reviewCount", "minPrice")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT ("supplierId", "supplierHotelId") DO NOTHING
    `, [
      hotel.supplierId, hotel.supplierHotelId, hotel.name, hotel.description,
      hotel.starRating, hotel.street, hotel.city, hotel.country,
      hotel.lat, hotel.lng, hotel.images, hotel.amenities, hotel.rooms,
      hotel.policies, hotel.avgRating, hotel.reviewCount, hotel.minPrice,
    ]);
  }

  // Seed promo code
  await ds.query(`
    INSERT INTO promo_codes (code, "discountType", "discountValue", "maxUses", "validFrom", "validUntil")
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (code) DO NOTHING
  `, ['WELCOME10', 'percentage', 10, 1000, new Date(), new Date(Date.now() + 365 * 86400000)]);

  console.log('Seed completed successfully');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
