import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Users table
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('customer', 'admin', 'supplier_manager');
      CREATE TABLE "users" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "email" varchar NOT NULL,
        "passwordHash" varchar NOT NULL,
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "phone" varchar,
        "avatarUrl" varchar,
        "role" user_role DEFAULT 'customer' NOT NULL,
        "preferredCurrency" varchar DEFAULT 'USD' NOT NULL,
        "preferredLanguage" varchar DEFAULT 'en' NOT NULL,
        "loyaltyPoints" int DEFAULT 0 NOT NULL,
        "isEmailVerified" boolean DEFAULT false NOT NULL,
        "refreshToken" varchar,
        "passwordResetToken" varchar,
        "passwordResetExpires" timestamptz,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`);

    // Suppliers table
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "code" varchar NOT NULL,
        "name" varchar NOT NULL,
        "type" varchar NOT NULL,
        "baseUrl" varchar NOT NULL,
        "isActive" boolean DEFAULT true NOT NULL,
        "encryptedCredentials" text NOT NULL,
        "rateLimit" int DEFAULT 100 NOT NULL,
        "timeout" int DEFAULT 30000 NOT NULL,
        "priority" int DEFAULT 0 NOT NULL,
        "config" jsonb,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_suppliers_code" UNIQUE ("code")
      )
    `);

    // Hotels table
    await queryRunner.query(`
      CREATE TABLE "hotels" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "supplierId" varchar NOT NULL,
        "supplierHotelId" varchar NOT NULL,
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "starRating" smallint DEFAULT 3 NOT NULL,
        "street" varchar NOT NULL,
        "city" varchar NOT NULL,
        "state" varchar,
        "country" varchar NOT NULL,
        "postalCode" varchar,
        "lat" decimal(10,7) NOT NULL,
        "lng" decimal(10,7) NOT NULL,
        "images" jsonb DEFAULT '[]' NOT NULL,
        "amenities" jsonb DEFAULT '[]' NOT NULL,
        "rooms" jsonb DEFAULT '[]' NOT NULL,
        "policies" jsonb,
        "avgRating" decimal(3,1) DEFAULT 0 NOT NULL,
        "reviewCount" int DEFAULT 0 NOT NULL,
        "minPrice" decimal(12,2) DEFAULT 0 NOT NULL,
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "isActive" boolean DEFAULT true NOT NULL,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_hotels" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_hotels_supplier" ON "hotels" ("supplierId", "supplierHotelId")`);
    await queryRunner.query(`CREATE INDEX "IDX_hotels_city_country" ON "hotels" ("city", "country")`);

    // Bookings table
    await queryRunner.query(`
      CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'failed', 'refunded');
      CREATE TYPE product_type AS ENUM ('hotel', 'flight', 'package', 'car_rental');
      CREATE TABLE "bookings" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "userId" uuid NOT NULL,
        "productType" product_type NOT NULL,
        "productId" varchar NOT NULL,
        "supplierId" varchar NOT NULL,
        "supplierBookingRef" varchar,
        "status" booking_status DEFAULT 'pending' NOT NULL,
        "checkIn" date NOT NULL,
        "checkOut" date NOT NULL,
        "guestCount" int DEFAULT 1 NOT NULL,
        "totalAmount" decimal(12,2) NOT NULL,
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "loyaltyPointsUsed" int DEFAULT 0 NOT NULL,
        "loyaltyPointsEarned" int DEFAULT 0 NOT NULL,
        "promoCode" varchar,
        "discountAmount" decimal(12,2) DEFAULT 0 NOT NULL,
        "guestDetails" jsonb,
        "notes" varchar,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_user" FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_user_status" ON "bookings" ("userId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_created" ON "bookings" ("createdAt")`);

    // Payments table
    await queryRunner.query(`
      CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded');
      CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'wallet');
      CREATE TABLE "payments" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "bookingId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "status" payment_status DEFAULT 'pending' NOT NULL,
        "method" payment_method DEFAULT 'card' NOT NULL,
        "stripePaymentIntentId" varchar,
        "stripeCustomerId" varchar,
        "metadata" jsonb,
        "failureReason" varchar,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_booking" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_payments_stripe" ON "payments" ("stripePaymentIntentId")`);

    // Loyalty transactions
    await queryRunner.query(`
      CREATE TYPE loyalty_type AS ENUM ('earned', 'redeemed', 'expired', 'bonus');
      CREATE TABLE "loyalty_transactions" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "userId" uuid NOT NULL,
        "bookingId" varchar,
        "points" int NOT NULL,
        "type" loyalty_type NOT NULL,
        "description" varchar NOT NULL,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_loyalty_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loyalty_user" FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);

    // Promo codes
    await queryRunner.query(`
      CREATE TABLE "promo_codes" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "code" varchar NOT NULL,
        "discountType" varchar DEFAULT 'percentage' NOT NULL,
        "discountValue" decimal(12,2) NOT NULL,
        "currency" varchar,
        "minBookingAmount" decimal(12,2),
        "maxUses" int DEFAULT 100 NOT NULL,
        "usedCount" int DEFAULT 0 NOT NULL,
        "validFrom" timestamptz NOT NULL,
        "validUntil" timestamptz NOT NULL,
        "isActive" boolean DEFAULT true NOT NULL,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_promo_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_promo_codes_code" UNIQUE ("code")
      )
    `);

    // Campaigns
    await queryRunner.query(`
      CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');
      CREATE TABLE "campaigns" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "name" varchar NOT NULL,
        "subject" varchar NOT NULL,
        "body" text NOT NULL,
        "targetAudience" varchar DEFAULT 'all' NOT NULL,
        "scheduledAt" timestamptz,
        "sentAt" timestamptz,
        "status" campaign_status DEFAULT 'draft' NOT NULL,
        "openRate" decimal(5,2),
        "clickRate" decimal(5,2),
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        "updatedAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_campaigns" PRIMARY KEY ("id")
      )
    `);

    // Notifications
    await queryRunner.query(`
      CREATE TYPE notification_type AS ENUM ('email', 'push', 'sms');
      CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
      CREATE TABLE "notifications" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "userId" uuid NOT NULL,
        "type" notification_type NOT NULL,
        "subject" varchar NOT NULL,
        "body" text NOT NULL,
        "status" notification_status DEFAULT 'pending' NOT NULL,
        "event" varchar,
        "metadata" jsonb,
        "createdAt" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "promo_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "loyalty_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS notification_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS notification_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS campaign_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS loyalty_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS product_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS booking_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role`);
  }
}
