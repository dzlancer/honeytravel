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
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('test123', 12);
  await ds.query(
    `INSERT INTO users (email, "passwordHash", "firstName", "lastName", role, "isEmailVerified", "loyaltyPoints")
     VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING`,
    ['admin@travelshopalgeria.com', adminHash, 'Admin', 'User', 'admin', true, 0],
  );
  await ds.query(
    `INSERT INTO users (email, "passwordHash", "firstName", "lastName", phone, role, "isEmailVerified", "loyaltyPoints")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING`,
    ['karim.benali@gmail.com', userHash, 'Karim', 'Benali', '+213 555 123 456', 'customer', true, 500],
  );
  await ds.query(
    `INSERT INTO users (email, "passwordHash", "firstName", "lastName", phone, role, "isEmailVerified", "loyaltyPoints")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING`,
    ['amira.hadj@gmail.com', userHash, 'Amira', 'Hadj', '+213 555 789 012', 'customer', true, 1200],
  );
  const karimRow = await ds.query(`SELECT id FROM users WHERE email = $1`, ['karim.benali@gmail.com']);
  const amiraRow = await ds.query(`SELECT id FROM users WHERE email = $1`, ['amira.hadj@gmail.com']);
  const karimId = karimRow[0]?.id;
  const amiraId = amiraRow[0]?.id;
  if (!karimId || !amiraId) { console.error('Could not find test user IDs'); await ds.destroy(); return; }
  const creds = encrypt(JSON.stringify({ apiKey: 'mock-api-key-12345', secret: 'mock-secret' }));
  const supplierRows = [
    { code: 'mock-hotels', name: 'Mock Hotel Supplier', type: 'hotel' },
    { code: 'mock-flights', name: 'Mock Flight Supplier', type: 'flight' },
    { code: 'mock-activities', name: 'Mock Activity Supplier', type: 'activity' },
    { code: 'mock-cars', name: 'Mock Car Rental Supplier', type: 'car_rental' },
  ];
  for (const s of supplierRows) {
    await ds.query(
      `INSERT INTO suppliers (code, name, type, "baseUrl", "encryptedCredentials", "rateLimit", timeout)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (code) DO NOTHING`,
      [s.code, s.name, s.type, 'http://localhost:3001/api/mock-supplier', creds, 60, 10000],
    );
  }
  // --- 3. Seed 12 Hotels ---
  const hotels = [
    {
      supplierId: "mock-hotels", supplierHotelId: "MH001", name: "Grand Hotel Algiers",
      description: "Luxurious 5-star hotel in Algiers with stunning Mediterranean views near the Martyrs Memorial and the Casbah.",
      starRating: 5, street: "1 Boulevard Che Guevara", city: "Algiers", country: 'Algeria',
      lat: 36.7538, lng: 3.0588,
      images: JSON.stringify(["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"]),
      amenities: JSON.stringify(["wifi","pool","spa","restaurant","gym","parking","room_service","concierge"]),
      rooms: JSON.stringify([{"id":"R001","name":"Standard Sea View","description":"Comfortable room with Mediterranean views","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":250,"currency":"USD"},{"id":"R002","name":"Superior Room","description":"Spacious room with premium furnishings","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":300,"currency":"USD"},{"id":"R003","name":"Presidential Suite","description":"Luxury suite with jacuzzi","maxOccupancy":4,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":370,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.7, reviewCount: 342, minPrice: 250,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH002", name: "Sahara Oasis Resort",
      description: "Unique desert resort in Ghardaia with traditional Mzab Valley architecture and Saharan hospitality.",
      starRating: 4, street: "Route de Ghardaia", city: "Ghardaia", country: 'Algeria',
      lat: 32.4912, lng: 3.6735,
      images: JSON.stringify(["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"]),
      amenities: JSON.stringify(["wifi","pool","restaurant","spa","parking","garden"]),
      rooms: JSON.stringify([{"id":"R004","name":"Standard Desert Room","description":"Traditional room with desert views","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":120,"currency":"USD"},{"id":"R005","name":"Superior Courtyard Room","description":"Room overlooking the palm courtyard","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":170,"currency":"USD"},{"id":"R006","name":"Oasis Suite","description":"Spacious suite with private terrace","maxOccupancy":3,"bedType":"King + Daybed","amenities":["wifi","minibar"],"images":[],"pricePerNight":240,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"15:00","checkOutTime":"11:00","cancellationPolicy":"Free cancellation up to 48h before check-in"}),
      avgRating: 4.3, reviewCount: 128, minPrice: 120,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH003", name: "Constantine Cliff Hotel",
      description: "Modern 4-star hotel above the dramatic Rhumel Gorge with panoramic views of the suspension bridge.",
      starRating: 4, street: "Boulevard Zighoud Youcef", city: "Constantine", country: 'Algeria',
      lat: 36.365, lng: 6.6147,
      images: JSON.stringify(["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800","https://images.unsplash.com/photo-1618773928121-c32f082f97da?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","gym","parking","conference_room","bar"]),
      rooms: JSON.stringify([{"id":"R007","name":"Standard Gorge View","description":"Room with views of the Rhumel Gorge","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":150,"currency":"USD"},{"id":"R008","name":"Superior Bridge View","description":"Premium room facing the suspension bridge","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":200,"currency":"USD"},{"id":"R009","name":"Cliff Suite","description":"Corner suite with panoramic gorge views","maxOccupancy":3,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":270,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.5, reviewCount: 215, minPrice: 150,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH004", name: "Hotel El Aurassi",
      description: "Iconic 5-star landmark overlooking the Bay of Algiers with rooftop restaurant near the Botanical Garden.",
      starRating: 5, street: "2 Boulevard Frantz Fanon", city: "Algiers", country: 'Algeria',
      lat: 36.747, lng: 3.057,
      images: JSON.stringify(["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800","https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]),
      amenities: JSON.stringify(["wifi","pool","spa","restaurant","gym","parking","room_service","business_center","rooftop_bar"]),
      rooms: JSON.stringify([{"id":"R010","name":"Standard Bay View","description":"Elegant room with Bay of Algiers panorama","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":280,"currency":"USD"},{"id":"R011","name":"Superior Deluxe","description":"Refined room with premium amenities","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":330,"currency":"USD"},{"id":"R012","name":"Aurassi Suite","description":"Signature suite with wraparound terrace","maxOccupancy":4,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":400,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.6, reviewCount: 489, minPrice: 280,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH005", name: "Le Meridien Oran",
      description: "Prestigious 5-star seafront hotel in Oran with views of the Santa Cruz Fort near the Front de Mer.",
      starRating: 5, street: "1 Place du 1er Novembre", city: "Oran", country: 'Algeria',
      lat: 35.6969, lng: -0.6331,
      images: JSON.stringify(["https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"]),
      amenities: JSON.stringify(["wifi","pool","spa","restaurant","gym","parking","room_service","beach_access","concierge"]),
      rooms: JSON.stringify([{"id":"R013","name":"Standard Mediterranean","description":"Bright room with Mediterranean Sea views","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":220,"currency":"USD"},{"id":"R014","name":"Superior Sea Front","description":"Premium room with sea-facing balcony","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":270,"currency":"USD"},{"id":"R015","name":"Meridien Suite","description":"Luxurious suite with panoramic sea views","maxOccupancy":4,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":340,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.8, reviewCount: 376, minPrice: 220,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH006", name: "Tassili Hotel Djanet",
      description: "Charming 3-star hotel near Tassili National Park with Tuareg-inspired decor and Tadrart Rouge views.",
      starRating: 3, street: "Avenue de la Republique", city: "Djanet", country: 'Algeria',
      lat: 24.5525, lng: 9.4848,
      images: JSON.stringify(["https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800","https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","parking","garden","tour_desk"]),
      rooms: JSON.stringify([{"id":"R016","name":"Standard Desert Room","description":"Simple room with Saharan views","maxOccupancy":2,"bedType":"Twin","amenities":["wifi","minibar"],"images":[],"pricePerNight":85,"currency":"USD"},{"id":"R017","name":"Superior Tassili Room","description":"Room with traditional Tuareg decor","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":135,"currency":"USD"},{"id":"R018","name":"Djanet Suite","description":"Rooftop suite with desert terrace","maxOccupancy":3,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":205,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 72h before check-in"}),
      avgRating: 4.1, reviewCount: 87, minPrice: 85,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH007", name: "Royal Hotel Tlemcen",
      description: "Elegant 4-star hotel in Tlemcen, the Pearl of the Maghreb, near the Great Mosque and Mansourah ruins.",
      starRating: 4, street: "Rue de Independence", city: "Tlemcen", country: 'Algeria',
      lat: 34.8828, lng: -1.3167,
      images: JSON.stringify(["https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","parking","spa","garden","conference_room"]),
      rooms: JSON.stringify([{"id":"R019","name":"Standard Heritage Room","description":"Classic room with Andalusian decor","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":130,"currency":"USD"},{"id":"R020","name":"Superior Garden View","description":"Room overlooking the Andalusian garden","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":180,"currency":"USD"},{"id":"R021","name":"Royal Suite","description":"Ornate suite with Moorish details","maxOccupancy":3,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":250,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.4, reviewCount: 163, minPrice: 130,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH008", name: "Bejaia Beach Resort",
      description: "Seaside 4-star resort in Bejaia overlooking Cap Carbon with beach access and views of Yemma Gouraya.",
      starRating: 4, street: "Route de la Corniche", city: "Bejaia", country: 'Algeria',
      lat: 36.7515, lng: 5.0847,
      images: JSON.stringify(["https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=800","https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"]),
      amenities: JSON.stringify(["wifi","pool","restaurant","beach_access","water_sports","parking","spa"]),
      rooms: JSON.stringify([{"id":"R022","name":"Standard Beach Room","description":"Comfortable room near the beach","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":160,"currency":"USD"},{"id":"R023","name":"Superior Sea View","description":"Room with panoramic Mediterranean views","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":210,"currency":"USD"},{"id":"R024","name":"Beach Suite","description":"Suite with beach access and private terrace","maxOccupancy":4,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":280,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.5, reviewCount: 198, minPrice: 160,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH009", name: "Hotel Cirta Constantine",
      description: "Well-located 3-star hotel in Constantine near the Ahmed Bey Palace and Souq el-Ghzel market.",
      starRating: 3, street: "Rue Didouche Mourad", city: "Constantine", country: 'Algeria',
      lat: 36.3654, lng: 6.6145,
      images: JSON.stringify(["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800","https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","parking","laundry"]),
      rooms: JSON.stringify([{"id":"R025","name":"Standard City Room","description":"Clean room in the city center","maxOccupancy":2,"bedType":"Twin","amenities":["wifi","minibar"],"images":[],"pricePerNight":95,"currency":"USD"},{"id":"R026","name":"Superior Room","description":"Upgraded room with city views","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":145,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4, reviewCount: 102, minPrice: 95,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH010", name: "Timgad Heritage Inn",
      description: "Cozy 3-star inn near the UNESCO-listed Roman ruins of Timgad founded by Emperor Trajan in 100 AD.",
      starRating: 3, street: "Route de Timgad", city: "Batna", country: 'Algeria',
      lat: 35.4849, lng: 6.4685,
      images: JSON.stringify(["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","parking","garden","tour_desk"]),
      rooms: JSON.stringify([{"id":"R027","name":"Standard Heritage Room","description":"Simple room with local stone decor","maxOccupancy":2,"bedType":"Twin","amenities":["wifi","minibar"],"images":[],"pricePerNight":75,"currency":"USD"},{"id":"R028","name":"Superior Room","description":"Room with garden views","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":125,"currency":"USD"},{"id":"R029","name":"Heritage Suite","description":"Suite with views toward Timgad ruins","maxOccupancy":3,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":195,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 48h before check-in"}),
      avgRating: 4.2, reviewCount: 74, minPrice: 75,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH011", name: "Setif Park Hotel",
      description: "Contemporary 4-star hotel in Setif overlooking the Ain El Fouara fountain park near the Roman site of Djemila.",
      starRating: 4, street: "Avenue du 1er Novembre", city: "Setif", country: 'Algeria',
      lat: 36.1898, lng: 5.4108,
      images: JSON.stringify(["https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800","https://images.unsplash.com/photo-1521783988139-89397d761dce?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","gym","parking","conference_room","bar"]),
      rooms: JSON.stringify([{"id":"R030","name":"Standard Park View","description":"Room overlooking the central park","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":110,"currency":"USD"},{"id":"R031","name":"Superior Room","description":"Modern room with upgraded furnishings","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":160,"currency":"USD"},{"id":"R032","name":"Park Suite","description":"Suite with living area and park panorama","maxOccupancy":3,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":230,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.3, reviewCount: 145, minPrice: 110,
    },
    {
      supplierId: "mock-hotels", supplierHotelId: "MH012", name: "Tipaza Sea View",
      description: "Charming 4-star coastal hotel in Tipaza with views of the UNESCO-listed Roman ruins and Mediterranean coast.",
      starRating: 4, street: "Chemin des Ruines Romaines", city: "Tipaza", country: 'Algeria',
      lat: 36.5906, lng: 2.4469,
      images: JSON.stringify(["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800","https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800"]),
      amenities: JSON.stringify(["wifi","restaurant","pool","parking","beach_access","garden"]),
      rooms: JSON.stringify([{"id":"R033","name":"Standard Room","description":"Comfortable room with garden views","maxOccupancy":2,"bedType":"Queen","amenities":["wifi","minibar"],"images":[],"pricePerNight":140,"currency":"USD"},{"id":"R034","name":"Superior Sea View","description":"Room with Mediterranean and ruins views","maxOccupancy":2,"bedType":"King","amenities":["wifi","minibar"],"images":[],"pricePerNight":190,"currency":"USD"},{"id":"R035","name":"Tipaza Suite","description":"Suite overlooking the Roman ruins and sea","maxOccupancy":3,"bedType":"King + Sofa","amenities":["wifi","minibar"],"images":[],"pricePerNight":260,"currency":"USD"}]),
      policies: JSON.stringify({"checkInTime":"14:00","checkOutTime":"12:00","cancellationPolicy":"Free cancellation up to 24h before check-in"}),
      avgRating: 4.4, reviewCount: 201, minPrice: 140,
    },
  ];
  for (const hotel of hotels) {
    await ds.query(
      `INSERT INTO hotels ("supplierId", "supplierHotelId", name, description, "starRating",
        street, city, country, lat, lng, images, amenities, rooms, policies,
        "avgRating", "reviewCount", "minPrice")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT ("supplierId", "supplierHotelId") DO NOTHING`,
      [hotel.supplierId, hotel.supplierHotelId, hotel.name, hotel.description,
        hotel.starRating, hotel.street, hotel.city, hotel.country,
        hotel.lat, hotel.lng, hotel.images, hotel.amenities, hotel.rooms,
        hotel.policies, hotel.avgRating, hotel.reviewCount, hotel.minPrice],
    );
  }

  // --- 4. Seed Promo Codes ---
  const now = new Date();
  const oneYearLater = new Date(Date.now() + 365 * 86400000);
  const promos = [
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, maxUses: 1000, minBookingAmount: null as number | null },
    { code: 'SUMMER25', discountType: 'percentage', discountValue: 25, maxUses: 500, minBookingAmount: 200 },
    { code: 'SAHARA15', discountType: 'percentage', discountValue: 15, maxUses: 300, minBookingAmount: 100 },
  ];
  for (const p of promos) {
    await ds.query(
      `INSERT INTO promo_codes (code, "discountType", "discountValue", "maxUses", "minBookingAmount", "validFrom", "validUntil")
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (code) DO NOTHING`,
      [p.code, p.discountType, p.discountValue, p.maxUses, p.minBookingAmount, now, oneYearLater],
    );
  }

  // --- 5. Seed Bookings ---
  const bookings = [
    {
      userId: karimId, productType: 'hotel', productId: 'MH001', supplierId: 'mock-hotels',
      supplierBookingRef: 'MOCK-BK000001', status: 'confirmed',
      checkIn: '2026-04-10', checkOut: '2026-04-14', guestCount: 2,
      totalAmount: 1000, currency: 'USD', loyaltyPointsEarned: 100,
      promoCode: null as string | null, discountAmount: 0,
      guestDetails: JSON.stringify([{"firstName":"Karim","lastName":"Benali","email":"karim.benali@gmail.com","phone":"+213 555 123 456"}]),
    },
    {
      userId: karimId, productType: 'flight', productId: 'AH-1024', supplierId: 'mock-flights',
      supplierBookingRef: 'MOCK-FL000001', status: 'confirmed',
      checkIn: '2026-04-10', checkOut: '2026-04-10', guestCount: 1,
      totalAmount: 85, currency: 'USD', loyaltyPointsEarned: 8,
      promoCode: null as string | null, discountAmount: 0,
      guestDetails: JSON.stringify([{"firstName":"Karim","lastName":"Benali","email":"karim.benali@gmail.com"}]),
    },
    {
      userId: amiraId, productType: 'hotel', productId: 'MH005', supplierId: 'mock-hotels',
      supplierBookingRef: 'MOCK-BK000002', status: 'completed',
      checkIn: '2026-03-01', checkOut: '2026-03-04', guestCount: 2,
      totalAmount: 660, currency: 'USD', loyaltyPointsEarned: 66,
      promoCode: 'WELCOME10' as string | null, discountAmount: 66,
      guestDetails: JSON.stringify([{"firstName":"Amira","lastName":"Hadj","email":"amira.hadj@gmail.com","phone":"+213 555 789 012"}]),
    },
    {
      userId: amiraId, productType: 'activity', productId: 'ACT-CASBAH-01', supplierId: 'mock-activities',
      supplierBookingRef: 'MOCK-ACT00001', status: 'completed',
      checkIn: '2026-02-20', checkOut: '2026-02-20', guestCount: 2,
      totalAmount: 50, currency: 'USD', loyaltyPointsEarned: 5,
      promoCode: null as string | null, discountAmount: 0,
      guestDetails: JSON.stringify([{"firstName":"Amira","lastName":"Hadj","email":"amira.hadj@gmail.com"}]),
    },
    {
      userId: karimId, productType: 'car_rental', productId: 'CAR-TLC-01', supplierId: 'mock-cars',
      supplierBookingRef: 'MOCK-CAR00001', status: 'confirmed',
      checkIn: '2026-04-10', checkOut: '2026-04-17', guestCount: 1,
      totalAmount: 840, currency: 'USD', loyaltyPointsEarned: 84,
      promoCode: null as string | null, discountAmount: 0,
      guestDetails: JSON.stringify([{"firstName":"Karim","lastName":"Benali","email":"karim.benali@gmail.com"}]),
    },
  ];
  for (const b of bookings) {
    await ds.query(
      `INSERT INTO bookings ("userId", "productType", "productId", "supplierId",
        "supplierBookingRef", status, "checkIn", "checkOut", "guestCount",
        "totalAmount", currency, "loyaltyPointsEarned", "promoCode", "discountAmount", "guestDetails")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [b.userId, b.productType, b.productId, b.supplierId,
        b.supplierBookingRef, b.status, b.checkIn, b.checkOut, b.guestCount,
        b.totalAmount, b.currency, b.loyaltyPointsEarned,
        b.promoCode, b.discountAmount, b.guestDetails],
    );
  }

  // --- 6. Seed Reviews ---
  const reviews = [
    {
      userId: karimId, productType: 'hotel', productId: 'MH001', rating: 5,
      title: "Exceptional stay in Algiers",
      comment: "The Grand Hotel Algiers exceeded all expectations. The sea view room was spectacular and the restaurant served amazing couscous.",
      isVerified: true, helpfulCount: 12,
    },
    {
      userId: karimId, productType: 'flight', productId: 'AH-1024', rating: 4,
      title: "Smooth domestic flight",
      comment: "Quick and efficient flight from Algiers to Oran. On-time departure with friendly cabin crew.",
      isVerified: true, helpfulCount: 5,
    },
    {
      userId: amiraId, productType: 'hotel', productId: 'MH005', rating: 5,
      title: "Beautiful Mediterranean views",
      comment: "Le Meridien Oran is stunning. The pool overlooking the sea is paradise. Rooms are modern and clean.",
      isVerified: true, helpfulCount: 18,
    },
    {
      userId: amiraId, productType: 'activity', productId: 'ACT-CASBAH-01', rating: 5,
      title: "Must-do tour in Algiers",
      comment: "Our guide was incredibly knowledgeable about the Casbah history and Ottoman architecture.",
      isVerified: true, helpfulCount: 22,
    },
    {
      userId: amiraId, productType: 'hotel', productId: 'MH002', rating: 4,
      title: "Unique desert experience",
      comment: "The Sahara Oasis Resort is truly special. The Mzab Valley architecture is beautiful. Wish the wifi was stronger.",
      isVerified: false, helpfulCount: 8,
    },
    {
      userId: karimId, productType: 'activity', productId: 'ACT-SAHARA-01', rating: 5,
      title: "Unforgettable desert trek",
      comment: "The camel trek through the dunes at sunset was magical. Our Tuareg guide shared fascinating stories.",
      isVerified: true, helpfulCount: 15,
    },
    {
      userId: karimId, productType: 'hotel', productId: 'MH003', rating: 4,
      title: "Great location above the gorge",
      comment: "The Constantine Cliff Hotel has an unbeatable location with incredible views of the Rhumel Gorge.",
      isVerified: true, helpfulCount: 9,
    },
    {
      userId: amiraId, productType: 'activity', productId: 'ACT-TIMGAD-01', rating: 5,
      title: "Absolutely breathtaking Roman ruins",
      comment: "Timgad is one of the best-preserved Roman cities. Walking through the ancient streets is unforgettable.",
      isVerified: true, helpfulCount: 31,
    },
  ];
  for (const r of reviews) {
    await ds.query(
      `INSERT INTO reviews ("userId", "productType", "productId", rating, title, comment, "isVerified", "helpfulCount")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [r.userId, r.productType, r.productId, r.rating, r.title, r.comment, r.isVerified, r.helpfulCount],
    );
  }

  // --- 7. Seed Loyalty Transactions ---
  const loyaltyTx = [
    { userId: karimId, points: 200, type: 'bonus', description: "Welcome bonus for joining Travel Shop Algeria" },
    { userId: karimId, points: 100, type: 'earned', description: "Earned from booking at Grand Hotel Algiers" },
    { userId: karimId, points: 8, type: 'earned', description: "Earned from flight AH 1024 ALG-ORN" },
    { userId: karimId, points: 84, type: 'earned', description: "Earned from Toyota Land Cruiser rental" },
    { userId: karimId, points: 108, type: 'earned', description: "Earned from activity bookings" },
    { userId: amiraId, points: 500, type: 'bonus', description: "Welcome bonus for joining Travel Shop Algeria" },
    { userId: amiraId, points: 66, type: 'earned', description: "Earned from booking at Le Meridien Oran" },
    { userId: amiraId, points: 5, type: 'earned', description: "Earned from Casbah Walking Tour" },
    { userId: amiraId, points: 629, type: 'earned', description: "Earned from various completed bookings" },
  ];
  for (const lt of loyaltyTx) {
    await ds.query(
      `INSERT INTO loyalty_transactions ("userId", points, type, description)
       VALUES ($1,$2,$3,$4)`,
      [lt.userId, lt.points, lt.type, lt.description],
    );
  }

  console.log('Seed completed successfully!');
  console.log('  - 3 users (1 admin + 2 test)');
  console.log('  - 4 suppliers (hotels, flights, activities, cars)');
  console.log('  - 12 hotels with 2-3 rooms each');
  console.log('  - 3 promo codes, 5 bookings, 8 reviews, 9 loyalty tx');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});