#!/bin/bash

echo "Starting application setup..."
npm install

echo "Starting application setup..."
cd client && npm install

echo "Building code execution Docker container..."
docker build -t scriptorium .

echo "Running Docker container..."
docker run --name scriptorium -dp 127.0.0.1:8080:8080 scriptorium

# Run database migrations
npx prisma migrate deploy

# Seed the database with data
echo "Seeding database..."
npx prisma db seed

echo "Database seeded!"
echo "Setup complete!"
