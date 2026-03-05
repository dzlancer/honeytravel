#!/bin/bash
set -e

echo "=== Travel Shop Algeria — Local Setup ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

echo "Starting infrastructure services..."
docker compose up -d postgres redis elasticsearch

echo "Waiting for services to be ready..."
sleep 10

echo "Setting up environment files..."
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env"
fi
if [ ! -f web/.env ]; then
  cp web/.env.example web/.env
  echo "Created web/.env"
fi

echo "Installing dependencies..."
npm install

echo "Running database migrations..."
cd backend
npm run migration:run

echo "Seeding database..."
npm run seed

echo ""
echo "=== Setup complete! ==="
echo "Start backend:  cd backend && npm run start:dev"
echo "Start web:      cd web && npm run dev"
echo ""
echo "API:     http://localhost:3001"
echo "Web:     http://localhost:3000"
echo "Swagger: http://localhost:3001/api/docs"
