#!/bin/bash

echo "Starting application setup..."
npm install

echo "Building code execution Docker container..."
docker build -t scriptorium .

echo "Running Docker container..."
docker run -dp 127.0.0.1:8080:8080 scriptorium

# Run database migrations
npx prisma migrate deploy

# Seed the database with an admin user if it doesn't exist
echo "Checking for existing admin user..."
npx prisma db seed

echo "Admin user created (if it didn't already exist)."
echo "Setup complete!"
