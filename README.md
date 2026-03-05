# Travel Shop Algeria — Online Travel Agency (OTA) Platform

A production-ready Online Travel Agency platform featuring a NestJS backend,
Next.js web frontend, and React Native mobile apps.

## Architecture Overview

```
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Next.js Web │  │ React Native │  │  Admin Dashboard  │
│   (SSR/SEO)  │  │  iOS/Android │  │   (Next.js)       │
└──────┬───────┘  └──────┬───────┘  └────────┬──────────┘
       │                 │                    │
       └─────────────────┼────────────────────┘
                         │  REST API (JWT Auth)
                  ┌──────▼──────┐
                  │   NestJS    │
                  │   Backend   │
                  └──────┬──────┘
       ┌─────────────────┼─────────────────────┐
       │                 │                      │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────────▼──────┐
│ PostgreSQL  │  │    Redis     │  │  Elasticsearch   │
│  (TypeORM)  │  │ Cache + Bull │  │  (Product Search) │
└─────────────┘  └──────────────┘  └──────────────────┘
       │
┌──────▼──────────────────────────────────┐
│         Supplier Adapters               │
│  ┌─────────┐ ┌─────────┐ ┌───────────┐ │
│  │ Hotels  │ │ Flights │ │ Car Rent  │ │
│  └─────────┘ └─────────┘ └───────────┘ │
└─────────────────────────────────────────┘
```

## Project Structure

```
honeytravel/
├── backend/          # NestJS API server
│   └── src/
│       ├── modules/  # Feature modules
│       │   ├── auth/         # JWT authentication
│       │   ├── users/        # User management
│       │   ├── suppliers/    # Supplier adapter framework
│       │   ├── bookings/     # Booking management
│       │   ├── payments/     # Stripe/Adyen integration
│       │   ├── notifications/# Email/push notifications
│       │   ├── search/       # Elasticsearch integration
│       │   ├── marketing/    # Campaigns & recommendations
│       │   ├── loyalty/      # Loyalty points program
│       │   └── admin/        # Admin panel APIs
│       ├── common/   # Shared utilities
│       ├── config/   # App configuration
│       └── database/ # Migrations & seeds
├── web/              # Next.js frontend (SSR)
│   └── src/
│       ├── app/          # App router pages
│       ├── components/   # React components
│       ├── lib/          # API client, utilities
│       ├── hooks/        # Custom React hooks
│       └── i18n/         # Translations (en, fr, ar)
├── mobile/           # React Native apps
│   └── src/
│       ├── screens/      # App screens
│       ├── components/   # Shared components
│       ├── navigation/   # React Navigation setup
│       └── services/     # API & storage services
├── shared/           # Shared types & constants
├── docker/           # Docker configs
├── docs/             # API & architecture docs
└── scripts/          # Dev & deploy scripts
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16, Redis 7, Elasticsearch 8

### Local Development

```bash
# 1. Clone and install
git clone <repo-url> && cd honeytravel
npm install

# 2. Start infrastructure
docker compose up -d postgres redis elasticsearch

# 3. Configure environment
cp backend/.env.example backend/.env
cp web/.env.example web/.env

# 4. Run database migrations
cd backend && npm run migration:run

# 5. Seed sample data
npm run seed

# 6. Start backend
npm run start:dev

# 7. Start web (in another terminal)
cd ../web && npm run dev
```

### Full Docker Setup
```bash
docker compose up --build
```
- Backend API: http://localhost:3001
- Web App: http://localhost:3000
- Swagger Docs: http://localhost:3001/api/docs
- Elasticsearch: http://localhost:9200
- Redis Commander: http://localhost:8081

## Adding a New Supplier

1. Create a new adapter in `backend/src/modules/suppliers/adapters/`:

```typescript
import { SupplierAdapter } from '../interfaces/supplier-adapter.interface';

export class MyNewSupplierAdapter implements SupplierAdapter {
  readonly supplierId = 'my-new-supplier';

  async searchHotels(criteria) { /* ... */ }
  async checkAvailability(hotelId, dates, occupancy) { /* ... */ }
  async createBooking(details) { /* ... */ }
  async cancelBooking(ref) { /* ... */ }
}
```

2. Register in `backend/src/modules/suppliers/suppliers.module.ts`:

```typescript
SupplierRegistryService.register('my-new-supplier', MyNewSupplierAdapter);
```

3. Add supplier credentials via Admin Dashboard or database seed.

## Key Features

- **Multi-supplier aggregation** with unified data model
- **JWT authentication** with refresh tokens
- **Faceted search** via Elasticsearch (price, rating, amenities, geo)
- **Multi-currency** with cached exchange rates
- **Multi-language** (English, French, Arabic)
- **Payment processing** via Stripe with webhook handling
- **Marketing automation** — abandoned cart emails, personalised deals
- **Loyalty program** with points tracking and redemption
- **Push notifications** via Firebase/APNS
- **Admin dashboard** for campaigns, promo codes, analytics
- **Rate limiting & circuit breakers** for supplier APIs
- **Docker + AWS deployment** ready

## Environment Variables

See `backend/.env.example` and `web/.env.example` for all configuration options.

## API Documentation

Start the backend and visit http://localhost:3001/api/docs for interactive Swagger docs.

## Deployment

See `docs/deployment.md` for full AWS deployment guide using ECS/Fargate.

## License

Proprietary — Travel Shop Algeria
