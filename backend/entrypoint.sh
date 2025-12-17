#!/bin/sh
# Wait for MySQL to be ready
echo "Waiting for database..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 2
done
echo "Database is ready!"

# Seed admin user
echo "Seeding admin user..."
npm run seed:admin || echo "Admin seed failed or already exists"

# Start backend server
echo "Starting backend server..."
exec npm start
